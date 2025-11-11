export type AiNodeTemplateType = 'pink' | 'purple' | 'green' | 'grey' | 'blue';
export type MessageType = 'text' | 'json' | 'code' | 'image';

export interface AiMessage {
  messageId: string;
  role: 'user' | 'assistant' | 'system';
  content?: string;
  type: MessageType;
  payload?: any;
  createdAt: string;
}

export interface Conversation {
  conversationId: string;
  sessionId: string;
  messages: AiMessage[];
  updatedAt: string;
}

export interface NodeAiMeta {
  conversationId: string;
  nodeId: string;
  lastMessageId?: string;
}

export type AiNodeTemplate = {
  type: AiNodeTemplateType;
  name: string;
  nodeDisplayName?: string;
  onMessage: (context: IAiCopilotContext, message: ChatMessage) => Promise<void>;
};
