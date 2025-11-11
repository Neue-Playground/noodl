// import Store from 'electron-store';

import { v4 as uuidv4 } from 'uuid';

import { EditorSettings } from '@noodl-utils/editorsettings';

const AI_ASSISTANT_ENABLED_KEY = 'aiAssistant.enabled';
const AI_ASSISTANT_SELECTED_MODEL_KEY = 'aiAssistant.selectedModel';
const OPENAI_API_KEY = 'aiAssistant.openaiApiKey';
const OPENAI_MODEL_KEY = 'aiAssistant.openaiModel';
const GEMINI_API_KEY = 'aiAssistant.geminiApiKey';
const GEMINI_MODEL_KEY = 'aiAssistant.geminiModel';
const GEMINI_VERIFIED_KEY = 'aiAssistant.geminiVerified';
const IMAGE_MODEL_KEY = 'aiAssistant.imageModel';
const OPENAI_VERIFIED_KEY = 'aiAssistant.openaiVerified';

export type AiEnabled = 'disabled' | 'enabled';
export type OpenAiModel = 'gpt-5' | 'gpt-5-mini' | 'gpt-5-nano' | 'disabled';
export type GeminiAiModel = 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-2.0-flash';
export type AiSelectedModel = 'disabled' | 'openai' | 'gemini';
export type AiImageModel = 'disabled' | 'gemini-2.5-flash-image-preview' | 'imagen-4.0-fast-generate-001';

interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class AiRemoteStore {
  private chatConversationId: string;
  private conversationsByNode: Map<string, string>; // nodeId -> conversationId

  constructor() {
    this.chatConversationId = uuidv4(); // persistent in-memory, replace w/ localStorage if needed
    this.conversationsByNode = new Map();
  }

  getChatConversationId() {
    return this.chatConversationId;
  }

  getConversationIdForNode(nodeId: string) {
    return this.conversationsByNode.get(nodeId) || null;
  }

  async ensureConversationForNode(nodeId: string): Promise<string> {
    const conversationId = this.conversationsByNode.get(nodeId);
    if (conversationId) return conversationId;

    const newConversationId = await this.createConversation();
    this.conversationsByNode.set(nodeId, newConversationId);
    return newConversationId;
  }

  // Optional: explicit node remapping if user moves UI elements
  linkConversationToNode(nodeId: string, conversationId: string) {
    this.conversationsByNode.set(nodeId, conversationId);
  }

  // Optional: clear local state (does not delete anything server-side)
  reset() {
    this.conversationsByNode.clear();
  }
}

export const AiStore = {
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
    return EditorSettings.instance.get(IMAGE_MODEL_KEY) || 'gemini-2.5-flash-image-preview';
  }
  /*setEndpoint(value: string) {
    EditorSettings.instance.set(AI_ASSISTANT_ENDPOINT_KEY, value);
  },
  getEndpoint() {
    return EditorSettings.instance.get(AI_ASSISTANT_ENDPOINT_KEY);
  }*/
};
