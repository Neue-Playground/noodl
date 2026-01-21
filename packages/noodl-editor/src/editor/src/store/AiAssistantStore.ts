import { EditorSettings } from '@noodl-utils/editorsettings';

const AI_ASSISTANT_ENABLED_KEY = 'aiAssistant.enabled';
const AI_ASSISTANT_SELECTED_MODEL_KEY = 'aiAssistant.selectedModel';
const GEMINI_MODEL_KEY = 'aiAssistant.geminiModel';
const IMAGE_MODEL_KEY = 'aiAssistant.imageModel';

export type AiEnabled = 'disabled' | 'enabled';
export type GeminiAiModel = 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-2.0-flash';
export type AiSelectedModel = 'disabled' | 'gemini';
export type AiImageModel = 'disabled' | 'gemini-2.5-flash-image' | 'imagen-4.0-fast-generate-001';

export class AiRemoteStore {
  private chatConversationId: string;
  private conversationsByNode: Map<string, string>; // nodeId -> conversationId
  private static CONVERSATIONS_KEY = 'aiAssistant.conversationsByNode';
  private static CHAT_CONVERSATION_ID_KEY = 'aiAssistant.chatConversationId';

  constructor() {
    // Load persisted chatConversationId or create
    this.chatConversationId = (EditorSettings.instance.get(AiRemoteStore.CHAT_CONVERSATION_ID_KEY) as string) || '';
    if (!EditorSettings.instance.get(AiRemoteStore.CHAT_CONVERSATION_ID_KEY)) {
      EditorSettings.instance.set(AiRemoteStore.CHAT_CONVERSATION_ID_KEY, this.chatConversationId);
    }

    // Load persisted node->conversation mappings
    const saved = (EditorSettings.instance.get(AiRemoteStore.CONVERSATIONS_KEY) as Record<string, string>) || {};
    this.conversationsByNode = new Map(Object.entries(saved));
  }

  getChatConversationId() {
    return this.chatConversationId;
  }

  getConversationIdForNode(nodeId: string) {
    return this.conversationsByNode.get(nodeId) || null;
  }

  // Optional: explicit node remapping if user moves UI elements
  linkConversationToNode(nodeId: string, conversationId: string) {
    this.conversationsByNode.set(nodeId, conversationId);
    this.persist();
  }

  unlinkConversationForNode(nodeId: string) {
    if (this.conversationsByNode.has(nodeId)) {
      this.conversationsByNode.delete(nodeId);
      this.persist();
    }
  }

  // Optional: clear local state (does not delete anything server-side)
  reset() {
    this.conversationsByNode.clear();
    this.persist();
  }

  private persist() {
    const obj: Record<string, string> = {};
    for (const [k, v] of this.conversationsByNode.entries()) obj[k] = v;
    EditorSettings.instance.set(AiRemoteStore.CONVERSATIONS_KEY, obj);
  }
}

export const AiStore = {
  getGeminiModel(): GeminiAiModel {
    return EditorSettings.instance.get(GEMINI_MODEL_KEY) || 'gemini-3-flash-preview';
  },
  setGeminiModel(value: GeminiAiModel) {
    EditorSettings.instance.set(GEMINI_MODEL_KEY, value);
  },
  setAiEnabled(value: AiEnabled) {
    EditorSettings.instance.set(AI_ASSISTANT_ENABLED_KEY, value);
  },
  getAiEnabled() {
    return EditorSettings.instance.get(AI_ASSISTANT_ENABLED_KEY) || 'enabled';
  },
  setAiSelectedModel(value: AiSelectedModel) {
    EditorSettings.instance.set(AI_ASSISTANT_SELECTED_MODEL_KEY, value);
  },
  getAiSelectedModel(): AiSelectedModel {
    return EditorSettings.instance.get(AI_ASSISTANT_SELECTED_MODEL_KEY) || 'gemini';
  },
  setImageModel(value: AiImageModel) {
    EditorSettings.instance.set(IMAGE_MODEL_KEY, value);
  },
  getImageModel(): AiImageModel {
    return EditorSettings.instance.get(IMAGE_MODEL_KEY) || 'gemini-2.5-flash-image';
  }
};
