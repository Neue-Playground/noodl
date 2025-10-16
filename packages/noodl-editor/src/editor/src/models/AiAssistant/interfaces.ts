import { AiTemplate } from '@noodl-models/AiAssistant/AiAssistantModel';
import { ChatHistory, ChatMessage } from '@noodl-models/AiAssistant/ChatHistory';
import { CopilotMessageAssistant } from '@noodl-models/AiAssistant/ChatMessage';
import { NodeGraphNode } from '@noodl-models/nodegraphmodel';

export type AiNodeTemplateType = 'pink' | 'purple' | 'green' | 'grey' | 'blue';

export type AiCopilotChatProviders = {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  responseSchema?: object;
};

export type AiCopilotChatMessage = {
  role: 'system' | 'user' | 'assistant' | string;
  content: string;
};

export type AiCopilotChatArgs = {
  messages: AiCopilotChatMessage[];
  provider?: AiCopilotChatProviders;
  abortController?: AbortController;
};

export type AiCopilotChatStreamArgs = Prettify<
  AiCopilotChatArgs & {
    onStream?: (fullText: string, text: string) => void;
    onEnd?: () => void;
  }
>;

export type AiCopilotChatStreamXmlArgs = Prettify<
  AiCopilotChatArgs & {
    onStream?: (tagName: string, text: string) => void;
    onTagOpen?: (tagName: string, attributes: Record<string, string>) => void;
    onTagEnd?: (tagName: string, fullText: string) => void;
    onEnd?: () => void;
  }
>;

export interface IAiCopilotContext {
  template: AiTemplate;
  chatHistory: ChatHistory;
  node: NodeGraphNode;
}

export type AiNodeTemplate = {
  type: AiNodeTemplateType;
  name: string;
  nodeDisplayName?: string;
  onMessage: (context: IAiCopilotContext, message: ChatMessage) => Promise<void>;
};

export interface ICopilotHistory {
  /** Send more information to AI. */
  respond(text: string): void;

  assistant(text: string): void;

  user(text: string): void;

  /** Notify the user. */
  notify(text: string): void;
}

export enum CopilotState {
  Idle,
  Processing
}

export interface ICopilotAgentExecutor {
  state: CopilotState;
  currentResponse: CopilotMessageAssistant | null;

  stop(): void;

  execute(): void;
}

export enum CopilotEvent {
  MessagesChanged,
  StateChanged
}

export type CopilotEvents = {
  [CopilotEvent.MessagesChanged]: () => void;
  [CopilotEvent.StateChanged]: () => void;
};
