// import Store from 'electron-store';

import { EditorSettings } from '@noodl-utils/editorsettings';

const AI_ASSISTANT_ENABLED_KEY = 'aiAssistant.enabled';
const AI_ASSISTANT_SELECTED_MODEL_KEY = 'aiAssistant.selectedModel';
//const AI_ASSISTANT_ENDPOINT_KEY = 'aiAssistant.endpoint';
const OPENAI_API_KEY = 'aiAssistant.openaiApiKey';
const OPENAI_MODEL_KEY = 'aiAssistant.openaiModel';
const GEMINI_API_KEY = 'aiAssistant.geminiApiKey';
const GEMINI_MODEL_KEY = 'aiAssistant.geminiModel';
const GEMINI_VERIFIED_KEY = 'aiAssistant.geminiVerified';
const IMAGE_MODEL_KEY = 'aiAssistant.imageModel';
const BYTEZ_API_KEY = 'aiAssistant.bytezApiKey';
const BYTEZ_MODEL_KEY = 'aiAssistant.bytezModel';
const OPENAI_VERIFIED_KEY = 'aiAssistant.openaiVerified';

export type AiEnabled = 'disabled' | 'enabled';
export type OpenAiModel = 'gpt-5' | 'gpt-5-mini' | 'gpt-5-nano';
export type GeminiAiModel = 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-2.0-flash';
export type BytezAiModel = 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B' | 'microsoft/Phi-3-mini-128k-instruct';
export type AiSelectedModel = 'disabled' | 'openai' | 'gemini' | 'bytez';
export type AiImageModel =
  | 'disabled'
  | 'gemini-2.0-flash'
  | 'gemini-2.5-flash-image-preview'
  | 'playgroundai/playground-v2.5-1024px-aesthetic';

export const OpenAiStore = {
  getOpenAiApiKey() {
    return EditorSettings.instance.get(OPENAI_API_KEY);
  },
  setOpenAiApiKey(value: string) {
    EditorSettings.instance.set(OPENAI_API_KEY, value);
  },
  getGeminiApiKey() {
    return EditorSettings.instance.get(GEMINI_API_KEY);
  },
  setGeminiApiKey(value: string) {
    EditorSettings.instance.set(GEMINI_API_KEY, value);
  },
  getOpenAiModel(): OpenAiModel {
    return EditorSettings.instance.get(OPENAI_MODEL_KEY) || 'disabled';
  },
  setOpenAiModel(value: OpenAiModel) {
    EditorSettings.instance.set(OPENAI_MODEL_KEY, value);
  },
  getGeminiModel(): GeminiAiModel {
    return EditorSettings.instance.get(GEMINI_MODEL_KEY) || 'gemini-2.5-flash';
  },
  setGeminiModel(value: GeminiAiModel) {
    EditorSettings.instance.set(GEMINI_MODEL_KEY, value);
  },
  getBytezApiKey() {
    return EditorSettings.instance.get(BYTEZ_API_KEY);
  },
  setBytezApiKey(value: string) {
    EditorSettings.instance.set(BYTEZ_API_KEY, value);
  },
  getBytezModel(): BytezAiModel {
    return EditorSettings.instance.get(BYTEZ_MODEL_KEY) || 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B';
  },
  setBytezModel(value: BytezAiModel) {
    EditorSettings.instance.set(BYTEZ_MODEL_KEY, value);
  },
  setAiEnabled(value: AiEnabled) {
    EditorSettings.instance.set(AI_ASSISTANT_ENABLED_KEY, value);
  },
  getAiEnabled() {
    return EditorSettings.instance.get(AI_ASSISTANT_ENABLED_KEY) || 'disabled';
  },
  setAiSelectedModel(value: AiSelectedModel) {
    EditorSettings.instance.set(AI_ASSISTANT_SELECTED_MODEL_KEY, value);
  },
  getAiSelectedModel(): AiSelectedModel {
    return EditorSettings.instance.get(AI_ASSISTANT_SELECTED_MODEL_KEY) || 'disabled';
  },
  setGeminiVerified(value: boolean) {
    EditorSettings.instance.set(GEMINI_VERIFIED_KEY, value);
  },
  getGeminiVerified() {
    return !!EditorSettings.instance.get(GEMINI_VERIFIED_KEY) || false;
  },
  setOpenAiVerified(value: boolean) {
    EditorSettings.instance.set(OPENAI_VERIFIED_KEY, value);
  },
  getOpenAiVerified() {
    return !!EditorSettings.instance.get(OPENAI_VERIFIED_KEY) || false;
  },
  setImageModel(value: AiImageModel) {
    EditorSettings.instance.set(IMAGE_MODEL_KEY, value);
  },
  getImageModel(): AiImageModel {
    return EditorSettings.instance.get(IMAGE_MODEL_KEY) || 'playgroundai/playground-v2.5-1024px-aesthetic';
  }
  /*setEndpoint(value: string) {
    EditorSettings.instance.set(AI_ASSISTANT_ENDPOINT_KEY, value);
  },
  getEndpoint() {
    return EditorSettings.instance.get(AI_ASSISTANT_ENDPOINT_KEY);
  }*/
};
