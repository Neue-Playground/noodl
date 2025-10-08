import { GoogleGenAI, ApiError, GenerateImagesParameters, Type, Content } from '@google/genai';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { OpenAiStore } from '@noodl-store/AiAssistantStore';

import { AiCopilotChatProviders, AiCopilotChatStreamArgs } from './interfaces';

export type AiAssistantModel = {
  name: string;
  displayName: string;
  promptTokenCost: number;
  completionTokenCost: number;
};

export interface AiAssistantConfig {
  version: string;
  models: AiAssistantModel[];
}

// =================================================================================================
// Centralized AI API
// =================================================================================================

export type AiProvider = 'openai' | 'gemini' | 'bytez';
export type AiApi = {
  chat: (args: Omit<AiCopilotChatStreamArgs, 'onStream' | 'onEnd'>) => Promise<string>;
  chatStream: (args: AiCopilotChatStreamArgs) => Promise<string>;
  makeImageGenerationRequest: (prompt: string) => Promise<{ type: string; data: Buffer }>;
  verifyApiKey: (apiKey: string) => Promise<any>;
};

function toChatProvider(provider: AiCopilotChatProviders | undefined) {
  return {
    model: provider?.model,
    temperature: provider?.temperature,
    max_tokens: provider?.max_tokens
  };
}

export async function verifyOpenAiApiKey(apiKey: string): Promise<Record<string, { id: string }> | null> {
  const response = await fetch(`https://api.openai.com/v1/models`, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + apiKey
    }
  });

  if (response.status !== 200) {
    return null;
  }

  const json = await response.json();

  const models = json.data.reduce((acc: Record<string, { id: string }>, item: any) => {
    acc[item.id] = { id: item.id };
    return acc;
  }, {});

  return models;
}

export async function verifyGeminiApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      method: 'GET'
    });

    if (response.status !== 200) {
      return false;
    }
    const json = await response.json();
    return json.models && json.models.length > 0;
  } catch {
    return false;
  }
}

export async function callGeminiImageApi(
  apiKey: string,
  model: string,
  prompt: string
): Promise<{ type: string; data: Buffer }> {
  // 1. Initialize with the current SDK (@google/genai) and the provided API key.
  const ai = new GoogleGenAI({ apiKey });
  const outputMimeType = 'image/jpeg';

  try {
    console.log(`[INFO] Generating image using model: ${model}`);

    if (model?.startsWith('imagen')) {
      const imageGenerationParameters: GenerateImagesParameters = {
        model: model,
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: outputMimeType,
          aspectRatio: '1:1'
        }
      };
      const response = await ai.models.generateImages(imageGenerationParameters);
      const imageResult = response.generatedImages?.[0]?.image;
      if (!imageResult?.imageBytes) {
        throw new Error('Image generation failed: No image data returned by the model.');
      }
      const base64Data = imageResult.imageBytes;
      const mimeType = outputMimeType;
      const buffer = Buffer.from(base64Data, 'base64');
      const type = mimeType.split('/')[1] || 'jpeg';
      return { type, data: buffer };
    } else if (model?.startsWith('gemini')) {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt
      });
      const imagePart = response.candidates[0]?.content?.parts?.find((part) => part.inlineData);
      if (!imagePart?.inlineData) {
        throw new Error('Gemini did not return image data.');
      }

      const { mimeType, data } = imagePart.inlineData;
      const buffer = Buffer.from(data, 'base64');
      const type = mimeType?.split('/')[1] || 'png';

      return { type, data: buffer };
    }

    throw new Error('Invalid model for image generation.');
  } catch (error: unknown) {
    // 4. Update Error Handling using the correct ApiError class
    if (error instanceof ApiError) {
      const message = error.message;
      let errorMessage: string;

      // Custom error messages based on status and content
      if (error.status === 401 || error.status === 403) {
        errorMessage = 'API key is invalid or unauthorized.';
      } else if (error.status === 429) {
        errorMessage = 'Quota exceeded or rate limited. Please try again later.';
      } else if (error.status === 400 && message.includes('SAFETY')) {
        errorMessage = 'Image generation blocked by safety filters. Please try a different prompt.';
      } else {
        errorMessage = `Gemini API Error (HTTP ${error.status}): ${message}`;
      }

      console.error(`[ERROR] ${errorMessage}`);
      throw new Error(errorMessage);
    }

    // Handle generic errors (e.g., network issues)
    throw new Error(`Failed to call image API: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function createBytezClusterIfNeeded(modelId: string, apiKey: string) {
  const url = `https://api.bytez.com/models/v2/${encodeURIComponent(modelId)}`;
  const options = {
    method: 'PUT',
    headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeout: 10, capacity: { max: 1 } })
  } as RequestInit;
  try {
    const response = await fetch(url, options);
    await response.json().catch(() => undefined);
  } catch (err) {
    console.warn('Bytez cluster init failed:', err);
  }
}

export async function directChatGeminiStream({
  messages,
  provider,
  abortController,
  onEnd,
  onStream
}: AiCopilotChatStreamArgs) {
  const GEMINI_API_KEY = OpenAiStore.getGeminiApiKey();

  if (!GEMINI_API_KEY) {
    // Use standard Error without specific API message
    throw new Error('Gemini API key not set. Please add it in Settings > AI.');
  }

  // Use the provided controller or create a new one
  const controller = abortController || new AbortController();
  let fullText = '';
  // Note: Completion token count is not easily calculable in real-time streaming
  // and is typically available only in non-streaming responses or specific metadata.
  // We maintain the variable but leave it at 0 to match the original signature.
  const completionTokenCount = 0;

  // 1. Correct Initialization: Use GoogleGenAI
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  try {
    const systemMessage = messages.find((m) => m.role === 'system');

    // 2. Prepare history in the correct Content[] format
    const history: Content[] = messages
      .filter((m) => m.role !== 'system')
      .slice(0, -1)
      .map((m) => ({
        // Convert 'assistant' to 'model' for Gemini API history
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    // 3. Extract the current user message
    const userMessage = messages[messages.length - 1].content;

    // 4. Prepare the configuration object
    const generationConfig: any = {
      temperature: provider.temperature || 0.7,
      maxOutputTokens: provider.max_tokens,
      // System instruction goes inside config for chat creation
      systemInstruction: systemMessage?.content
    };

    // 5. Handle Structured Output configuration
    if (provider.responseSchema) {
      generationConfig.responseMimeType = 'application/json';
      generationConfig.responseSchema = provider.responseSchema;
    }

    // 6. Create the chat session using the correct SDK method: ai.chats.create
    const chat = ai.chats.create({
      model: provider.model,
      history: history,
      config: generationConfig // Pass all configs here
    });

    // 7. Start the streaming conversation
    // The message is now passed as an object { message: userMessage }
    const result = await chat.sendMessageStream({ message: userMessage });

    // 8. Iterate through the stream and use chunk.text
    for await (const chunk of result) {
      if (controller.signal.aborted) break;

      // Use the 'text' property directly from the chunk
      const chunkText = chunk.text;

      if (chunkText) {
        fullText += chunkText;
        onStream && onStream(fullText, chunkText);
      }
    }

    onEnd && onEnd();
  } catch (error: unknown) {
    // 9. Updated Error Handling using ApiError and consistent messaging
    if (error instanceof ApiError) {
      const message = error.message;
      let errorMessage: string;

      if (error.status === 401 || error.status === 403) {
        errorMessage = 'Gemini API key is invalid or unauthorized.';
      } else if (error.status === 429) {
        errorMessage = 'Gemini quota exceeded. Please try again later.';
      } else if (error.status === 400 && message.includes('MODEL_NOT_FOUND')) {
        errorMessage = `Gemini model '${provider.model}' not found. Please check the model name.`;
      } else {
        errorMessage = `Gemini API Error (HTTP ${error.status}): ${message}`;
      }

      console.error(`[ERROR] ${errorMessage}`);
      throw new Error(errorMessage);
    }

    // Handle generic errors
    throw new Error(`Failed to call Gemini API: ${error instanceof Error ? error.message : String(error)}`);
  }

  return {
    fullText,
    completionTokenCount
  };
}

export async function directChatBytezStream({
  messages,
  provider,
  abortController,
  onEnd,
  onStream
}: AiCopilotChatStreamArgs) {
  const BYETZ_API_KEY = OpenAiStore.getBytezApiKey();
  if (!BYETZ_API_KEY) {
    throw new Error('Bytez API key not set. Please add it in Settings > AI.');
  }

  const controller = abortController || new AbortController();
  let fullText = '';
  const completionTokenCount = 0;

  try {
    const { default: Bytez } = await import('bytez.js');
    const sdk = new Bytez(BYETZ_API_KEY);
    const model = sdk.model(provider.model);
    await model.create();

    createBytezClusterIfNeeded(provider.model, BYETZ_API_KEY);

    const userMessage = messages[messages.length - 1].content;
    const stream = true as const;
    const readStream: AsyncIterable<string> = (await model.run(userMessage, stream)) as AsyncIterable<string>;

    for await (const chunk of readStream) {
      if (controller.signal.aborted) break;
      fullText += chunk;
      onStream && onStream(fullText, chunk);
    }
    onEnd && onEnd();
  } catch (error: any) {
    throw new Error(`Failed to call Bytez API: ${error.message}`);
  }

  return {
    fullText,
    completionTokenCount
  };
}

export async function directChatOpenAi({
  messages,
  provider,
  abortController,
  onEnd,
  onStream
}: AiCopilotChatStreamArgs) {
  const OPENAI_API_KEY = OpenAiStore.getOpenAiApiKey();
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not set. Please add it in Settings > AI.');
  const controller = abortController || new AbortController();
  const endpoint = `https://api.openai.com/v1/chat/completions`;

  let fullText = '';
  let completionTokenCount = 0;
  let tries = 2;

  await fetchEventSource(endpoint, {
    method: 'POST',
    openWhenHidden: true,
    headers: {
      Authorization: 'Bearer ' + OPENAI_API_KEY,
      'Content-Type': 'application/json'
    },
    signal: controller.signal,
    body: JSON.stringify({
      ...toChatProvider(provider),
      messages,
      stream: true
    }),
    async onopen(response) {
      if (response.ok) return;
      if (response.status === 429)
        throw new Error('OpenAI is overloaded or you are being rate limited. Please try again later.');
      if (response.status === 401) throw new Error('OpenAI API key is invalid or unauthorized.');
      if (response.status === 500 || response.status === 503)
        throw new Error('OpenAI service is temporarily unavailable.');
      if (response.status >= 400 && response.status < 500)
        throw new Error('OpenAI request failed: ' + response.status + ' ' + response.statusText);
      throw new Error('OpenAI server error: ' + response.status + ' ' + response.statusText);
    },
    onmessage(ev) {
      if (ev.data === '[DONE]') {
        controller.abort();
        return;
      }
      try {
        const json = JSON.parse(ev.data);
        const delta = json.choices[0].delta.content;
        if (delta) {
          completionTokenCount++;
          fullText += delta;
          onStream && onStream(fullText, delta);
        }
      } catch (error) {
        console.error(error);
      }
    },
    onclose() {
      onEnd && onEnd();
    },
    onerror(err) {
      const errText = err.toString();
      if (['FatalError'].includes(errText)) throw err;
      if (['RetriableError'].includes(errText)) {
        if (tries <= 0) throw new Error('OpenAI is currently facing heavy traffic. Please try again later.');
        tries--;
      } else {
        throw new Error('An unknown error occurred while communicating with OpenAI: ' + errText);
      }
    }
  });

  return { fullText, completionTokenCount };
}

// =================================================================================================
// Provider Implementations
// =================================================================================================

const openAiApi: AiApi = {
  async chat(args) {
    return new Promise<string>((resolve) => {
      let fullText = '';
      this.chatStream({
        ...args,
        onStream: (content) => {
          fullText = content;
        },
        onEnd: () => resolve(fullText)
      });
    });
  },
  async chatStream(args) {
    const model = OpenAiStore.getOpenAiModel();
    if (!model || model === 'disabled') throw new Error('OpenAI model not selected.');
    args.provider = { ...args.provider, model };
    const result = await directChatOpenAi(args);
    return result.fullText;
  },
  async makeImageGenerationRequest(prompt) {
    const OPENAI_API_KEY = OpenAiStore.getOpenAiApiKey();
    if (!OPENAI_API_KEY) throw new Error('OpenAI image generation requires an API key.');
    const response = await fetch(`https://api.openai.com/v1/images/generations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + OPENAI_API_KEY },
      body: JSON.stringify({ prompt, n: 1, size: '512x512', response_format: 'b64_json' })
    });
    const json = await response.json();
    if (json.error) throw new Error(json.error);
    const b64_json = json.data[0].b64_json;
    return { data: Buffer.from(b64_json, 'base64'), type: 'png' };
  },
  async verifyApiKey(apiKey: string) {
    return verifyOpenAiApiKey(apiKey);
  }
};

export const geminiApi: AiApi = {
  /**
   * Performs a chat completion and waits for the full response before resolving.
   * It uses the streaming function internally and accumulates the text.
   */
  async chat(args) {
    return new Promise<string>((resolve, reject) => {
      // FIX: Added reject to the promise constructor
      let fullText = '';

      // The streaming function is called. We must add .catch(reject)
      // to handle errors thrown by this.chatStream.
      this.chatStream({
        ...args,
        onStream: (content) => {
          fullText = content;
        },
        onEnd: () => resolve(fullText) // Resolve when the stream is fully complete
      }).catch(reject); // FIX: Ensure errors during streaming reject the outer Promise
    });
  },

  /**
   * Starts a streaming chat completion, relying on the 'onStream' callback
   * provided in the arguments to update the UI. It returns the final accumulated text.
   */
  async chatStream(args) {
    // Inject the selected Gemini model into the provider configuration
    const model = OpenAiStore.getGeminiModel();
    if (!model) throw new Error('Gemini model not selected.');

    // Clone and update args to inject the model without side effects on the original object
    const newArgs = { ...args, provider: { ...args.provider, model } };

    // directChatGeminiStream handles the streaming and callbacks internally
    const result = await directChatGeminiStream(newArgs);

    return result.fullText;
  },

  // Calls the dedicated image generation API
  async makeImageGenerationRequest(prompt) {
    const apiKey = OpenAiStore.getGeminiApiKey();
    if (!apiKey) throw new Error('Gemini image generation requires an API key.');

    const imageModel = OpenAiStore.getImageModel();

    // Allow both gemini-2.5-flash-image-preview (for editing) and imagen-4.0-* models for generation
    if (imageModel?.startsWith('gemini') || imageModel?.startsWith('imagen')) {
      return callGeminiImageApi(apiKey, imageModel, prompt);
    }

    throw new Error('Invalid Gemini or Imagen model selected for image generation.');
  },

  /**
   * Verifies the API key validity using a specific verification function.
   */
  async verifyApiKey(apiKey: string) {
    return verifyGeminiApiKey(apiKey);
  }
};

const bytezApi: AiApi = {
  async chat(args) {
    return new Promise<string>((resolve) => {
      let fullText = '';
      this.chatStream({
        ...args,
        onStream: (content) => {
          fullText = content;
        },
        onEnd: () => resolve(fullText)
      });
    });
  },
  async chatStream(args) {
    const model = OpenAiStore.getBytezModel();
    if (!model) throw new Error('Bytez model not selected.');
    args.provider = { ...args.provider, model };
    const result = await directChatBytezStream(args);
    return result.fullText;
  },
  async makeImageGenerationRequest(prompt) {
    const apiKey = OpenAiStore.getBytezApiKey();
    if (!apiKey) throw new Error('Bytez image generation requires an API key.');
    const { default: Bytez } = await import('bytez.js');
    const sdk = new Bytez(apiKey);
    const modelId = 'playgroundai/playground-v2.5-1024px-aesthetic';
    const model = sdk.model(modelId);
    await model.create();
    createBytezClusterIfNeeded(modelId, apiKey);
    const stream = true as const;
    const readStream: AsyncIterable<string> = (await model.run(prompt, stream)) as AsyncIterable<string>;
    let lastChunk = '';
    for await (const chunk of readStream) lastChunk = chunk;
    const base64 = lastChunk.split(',')[1] || lastChunk;
    return { type: 'png', data: Buffer.from(base64, 'base64') };
  },
  async verifyApiKey() {
    return Promise.resolve(true);
  }
};

const apiProviders: Record<AiProvider, AiApi> = {
  openai: openAiApi,
  gemini: geminiApi,
  bytez: bytezApi
};

// =================================================================================================
// Main Ai Namespace
// =================================================================================================

export namespace Ai {
  export async function chat(args: Omit<AiCopilotChatStreamArgs, 'onStream' | 'onEnd'>): Promise<string> {
    return new Promise<string>((resolve) => {
      let fullText = '';
      chatStream({
        ...args,
        onStream: (content) => {
          fullText = content;
        },
        onEnd: () => resolve(fullText)
      });
    });
  }

  export async function chatStream(args: AiCopilotChatStreamArgs): Promise<string> {
    const selectedProvider = OpenAiStore.getAiSelectedModel() as AiProvider;
    if (!selectedProvider || !apiProviders[selectedProvider]) {
      throw new Error(`No AI model selected. Please select a model in Settings > AI.`);
    }
    return apiProviders[selectedProvider].chatStream(args);
  }

  export async function chatWithSelectedModel(
    messages: any[],
    onStream?: (full: string, delta: string) => void
  ): Promise<string> {
    const selectedModel = OpenAiStore.getAiSelectedModel();
    if (!selectedModel || selectedModel === 'disabled') {
      throw new Error('AI is disabled. Please enable an AI model in the editor settings.');
    }
    const args: AiCopilotChatStreamArgs = {
      provider: { model: '', temperature: 0.0, max_tokens: 2048 },
      messages,
      onStream,
      onEnd: () => {}
    };
    return chatStream(args);
  }

  export async function makeImageGenerationRequest(prompt: string): Promise<{ type: string; data: Buffer }> {
    const imageModel = OpenAiStore.getImageModel();
    if (imageModel === 'disabled') {
      throw new Error('Image generation is disabled. Select an image model in Settings > AI.');
    }
    if (imageModel.startsWith('playground')) {
      return apiProviders.bytez.makeImageGenerationRequest(prompt);
    } else if (imageModel?.startsWith('gemini') || imageModel?.startsWith('imagen')) {
      return apiProviders.gemini.makeImageGenerationRequest(prompt);
    } else {
      return apiProviders.openai.makeImageGenerationRequest(prompt);
    }
  }

  export async function verifyApiKey(provider: AiProvider, apiKey: string): Promise<any> {
    if (!apiProviders[provider]) throw new Error(`Unknown AI provider: ${provider}`);
    return apiProviders[provider].verifyApiKey(apiKey);
  }
}
