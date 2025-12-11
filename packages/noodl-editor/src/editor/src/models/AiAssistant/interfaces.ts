import { AiTemplate } from '@noodl-models/AiAssistant/AiAssistantModel';
import { ChatHistory, ChatMessage } from '@noodl-models/AiAssistant/ChatHistory';
import { NodeGraphNode } from '@noodl-models/nodegraphmodel';

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

// --- Cloud chat API types ---
// Request payload for a non-streaming chat call
export interface ChatRequest {
  userId: string;
  templateId: string;
  conversationId?: string;
  userPrompt: string;
  provider?: unknown;
  model?: string;
  context?: unknown;
}

// Response from a non-streaming chat call
export interface ChatResponse {
  conversation: Conversation;
  responseMessage: unknown;
}

// Streaming chunk types emitted by the server during a streaming chat
export type ChatStreamChunk =
  | { type: 'chunk'; content: string }
  | { type: 'done' }
  | { type: 'error'; message: string }
  | { type: 'conversation'; data: Conversation };

// Parameters accepted by the streaming chat helper
export interface ChatStreamParams extends ChatRequest {
  onStream?: (fullText: string) => void;
  onChunk?: (chunk: ChatStreamChunk) => void;
  signal?: AbortSignal;
}

// Result returned by the streaming chat helper
export interface ChatStreamResult {
  fullText: string;
  conversation?: Conversation;
}

// Function shapes for implementations (cloud client, shims, etc.)
export type ChatFunction = (body: ChatRequest) => Promise<ChatResponse>;
export type ChatStreamFunction = (params: ChatStreamParams) => Promise<ChatStreamResult>;

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

export interface IAiCopilotContext {
  template: AiTemplate;
  chatHistory: ChatHistory;
  node: NodeGraphNode;
  abortController?: AbortController;
  // Helpers exposed to templates to perform chat calls scoped to this context.
  chatStream?: (params: ChatStreamParams) => Promise<ChatStreamResult>;
  chatStreamXml?: (
    params: ChatStreamParams & { onTagOpen?: (tagName: string, attributes?: Record<string, string>) => void }
  ) => Promise<ChatStreamResult>;
}
