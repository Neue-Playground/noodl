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
  } catch (error) {
    return false;
  }
}

export async function callGeminiApi(apiKey: string, model: string, prompt: string): Promise<string> {
  try {
    // Use the official Google Generative AI library
    const { GoogleGenerativeAI } = await import('@google/generative-ai');

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model });

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Gemini API key is invalid or unauthorized.');
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error('Gemini quota exceeded. Please try again later.');
    } else if (error.message?.includes('MODEL_NOT_FOUND')) {
      throw new Error(`Gemini model '${model}' not found. Please check the model name.`);
    } else {
      throw new Error(`Failed to call Gemini API: ${error.message}`);
    }
  }
}

export async function callGeminiChatApi(
  apiKey: string,
  model: string,
  userMessage: string,
  history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>
): Promise<{ response: string; updatedHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> }> {
  try {
    // Use the official Google Generative AI library
    const { GoogleGenerativeAI } = await import('@google/generative-ai');

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model });

    // Start a chat session with history
    const chat = geminiModel.startChat({
      history: history,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    });

    // Send the user message
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const responseText = response.text();

    // Update history with both user message and AI response
    const updatedHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [
      ...history,
      { role: 'user' as const, parts: [{ text: userMessage }] },
      { role: 'model' as const, parts: [{ text: responseText }] }
    ];

    return {
      response: responseText,
      updatedHistory: updatedHistory
    };
  } catch (error) {
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Gemini API key is invalid or unauthorized.');
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error('Gemini quota exceeded. Please try again later.');
    } else if (error.message?.includes('MODEL_NOT_FOUND')) {
      throw new Error(`Gemini model '${model}' not found. Please check the model name.`);
    } else {
      throw new Error(`Failed to call Gemini Chat API: ${error.message}`);
    }
  }
}

export async function callGeminiImageApi(
  apiKey: string,
  model: string,
  prompt: string
): Promise<{ type: string; data: Buffer }> {
  try {
    // Use the official Google Generative AI library for image generation
    const { GoogleGenerativeAI } = await import('@google/generative-ai');

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model });

    // Generate image content
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;

    // Extract image data from response
    const imagePart = response.candidates[0]?.content?.parts?.find((part) => part.inlineData);
    if (!imagePart?.inlineData) {
      throw new Error('Gemini did not return image data.');
    }

    const { mimeType, data } = imagePart.inlineData;
    const buffer = Buffer.from(data, 'base64');
    const type = mimeType?.split('/')[1] || 'png';

    return { type, data: buffer };
  } catch (error) {
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Gemini API key is invalid or unauthorized.');
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error('Gemini quota exceeded. Please try again later.');
    } else if (error.message?.includes('MODEL_NOT_FOUND')) {
      throw new Error(`Gemini model '${model}' not found. Please check the model name.`);
    } else if (error.message?.includes('SAFETY')) {
      throw new Error('Image generation blocked by safety filters. Please try a different prompt.');
    } else {
      throw new Error(`Failed to call Gemini Image API: ${error.message}`);
    }
  }
}
