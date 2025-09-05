import path from 'node:path';
import { OpenAiStore } from '@noodl-store/AiAssistantStore';
import { filesystem } from '@noodl/platform';

import { callGeminiImageApi } from '@noodl-models/AiAssistant/api';
import { ProjectModel } from '@noodl-models/projectmodel';
// import FileSystem from '@noodl-utils/filesystem';
import { guid } from '@noodl-utils/utils';

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

export async function makeImageGenerationRequest(prompt: string): Promise<{ type: string; data: Buffer }> {
  // Route based on selected image model only
  const imageModel = OpenAiStore.getImageModel();

  if (imageModel === 'disabled') {
    throw new Error('Image generation is disabled. Select an image model in Settings > AI.');
  }

  if (imageModel === 'playgroundai/playground-v2.5-1024px-aesthetic') {
    const apiKey = OpenAiStore.getBytezApiKey();
    if (!apiKey) throw new Error('Bytez image generation requires an API key. Please add it in Settings > AI.');

    const { default: Bytez } = await import('bytez.js');
    const sdk = new Bytez(apiKey);
    const modelId = 'playgroundai/playground-v2.5-1024px-aesthetic';
    const model = sdk.model(modelId);
    await model.create();

    // fire-and-forget cluster creation to speed up next calls
    createBytezClusterIfNeeded(modelId, apiKey);

    const stream = true as const;
    const readStream: AsyncIterable<string> = (await model.run(prompt, stream)) as AsyncIterable<string>;
    let lastChunk = '' as string;
    for await (const chunk of readStream) {
      lastChunk = chunk;
    }
    // chunk is base64 data url; extract data
    const base64 = lastChunk.split(',')[1] || lastChunk;
    return { type: 'png', data: Buffer.from(base64, 'base64') };
  }

  if (imageModel === 'gemini-2.5-flash-image-preview' || imageModel === 'gemini-2.0-flash') {
    const apiKey = OpenAiStore.getGeminiApiKey();
    if (!apiKey) throw new Error('Gemini image generation requires an API key. Please add it in Settings > AI.');
    const model = imageModel;
    return callGeminiImageApi(apiKey, model as string, prompt);
  }

  // OpenAI path
  const OPENAI_API_KEY = OpenAiStore.getOpenAiApiKey();
  if (!OPENAI_API_KEY) throw new Error('OpenAI image generation requires an API key. Please add it in Settings > AI.');
  const response = await fetch(`https://api.openai.com/v1/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + OPENAI_API_KEY
    },
    body: JSON.stringify({
      prompt,
      n: 1,
      size: '512x512',
      response_format: 'b64_json'
    })
  });

  const json = await response.json();

  if (json.error) {
    throw new Error(json.error);
  }

  const b64_json = json.data[0].b64_json;

  return { data: Buffer.from(b64_json, 'base64'), type: 'png' };
}

export async function saveImageDataToDisk(imageData: { type: string; data: Buffer }): Promise<string> {
  const projectFolder = ProjectModel.instance._retainedProjectDirectory;
  if (!projectFolder) throw new Error('Project has no folder');

  const filename = `image-${guid()}.${imageData.type}`;
  const folder = 'generated-images';
  const relativeFilePath = path.join(folder, filename);
  const absolutePath = path.join(projectFolder, relativeFilePath);

  await filesystem.makeDirectory(path.join(projectFolder, folder));
  await filesystem.writeFile(absolutePath, imageData.data);

  return relativeFilePath;
}

export async function makeChatRequest(model: string, messages: unknown[]) {
  const OPENAI_API_KEY = OpenAiStore.getOpenAiApiKey();
  const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + OPENAI_API_KEY
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.5,
      max_tokens: 2048
    })
  });

  const json = await response.json();
  if (json.error) {
    console.error(json.error);
    return null;
  } else {
    const promptTokenCost = 0.002;
    const completionTokenCost = 0.002;
    let cost =
      (json.usage.completion_tokens * completionTokenCost) / 1000 + (json.usage.prompt_tokens * promptTokenCost) / 1000;

    cost = Math.round(cost * 10000) / 10000; //round to 4 decimals

    console.log('prompt cost', `$${cost}`);

    return {
      content: json.choices[0].message.content,
      usage: json.usage
    };
  }
}
