import { AiAssistantModel } from '@noodl-models/AiAssistant/AiAssistantModel';
import { Model } from '@noodl-utils/model';

export enum ChatMessageType {
  User = 'user',
  Assistant = 'assistant'
}

export enum ChatHistoryState {
  Idle,
  Processing
}

export type ChatHistoryActivityId = 'processing' | 'code-generation';

export type ChatHistoryActivity = {
  id: ChatHistoryActivityId | string;
  name: string;
  status?: string;
};

export type ChatMessage = {
  snowflakeId: string;
  type: ChatMessageType;
  content: string;
  metadata: Record<string, unknown>;
};

export type ChatSuggestion = {
  id: string;
  text: string;
};

export enum ChatHistoryEvent {
  MessagesChanged,
  ActivitiesChanged,
  MetadataChanged
}

type ChatHistoryEvents = {
  [ChatHistoryEvent.MessagesChanged]: () => void;
  [ChatHistoryEvent.ActivitiesChanged]: (activities: readonly ChatHistoryActivity[]) => void;
  [ChatHistoryEvent.MetadataChanged]: () => void;
};

export class ChatHistory extends Model<ChatHistoryEvent, ChatHistoryEvents> {
  private _messages: ChatMessage[] = [];
  private _activities: ChatHistoryActivity[] = [];
  private _metadata: Record<string, unknown>;

  get messages() {
    return this._messages;
  }

  get metadata() {
    return this._metadata;
  }

  set metadata(value: Record<string, unknown>) {
    this._metadata = value || {};
    this.notifyListeners(ChatHistoryEvent.MetadataChanged);
  }

  get activities() {
    return this._activities;
  }

  get suggestions(): readonly ChatSuggestion[] {
    if (this._messages.length > 0) {
      const metadata = this._messages[this._messages.length - 1].metadata;
      return (metadata.suggestions as ChatSuggestion[]) || [];
    }

    // When there are no messages,
    // show a list of example suggestions
    const template = AiAssistantModel.instance.templates.find((x) => x.templateId === this.metadata.templateId);
    if (template) {
      return template.examples.map((x) => ({
        id: x,
        text: x
      }));
    }

    return [];
  }

  constructor(items: ChatMessage[], metadata: Record<string, unknown> = {}) {
    super();
    this._messages = items || [];
    this._metadata = metadata || {};
  }

  addActivity(activity: ChatHistoryActivity) {
    this._activities.push(activity);
    this.notifyListeners(ChatHistoryEvent.ActivitiesChanged, this._activities);
  }

  removeActivity(activityId: string) {
    const length = this._activities.length;
    this._activities = this._activities.filter((x) => x.id !== activityId);
    if (this._activities.length !== length) {
      this.notifyListeners(ChatHistoryEvent.ActivitiesChanged, this._activities);
    }
  }

  clearActivities() {
    if (this._activities.length === 0) return;
    this._activities.length = 0;
    this.notifyListeners(ChatHistoryEvent.ActivitiesChanged, this._activities);
  }

  add(message: PartialWithRequired<ChatMessage, 'content'>) {
    if (!message) {
      throw new Error();
    }

    message.snowflakeId = this.generateSnowflakeId();
    if (!message.type) message.type = ChatMessageType.User;
    if (!message.metadata) message.metadata = {};

    this.messages.push(message as ChatMessage);
    this.notifyListeners(ChatHistoryEvent.MessagesChanged);

    return message.snowflakeId;
  }

  generateSnowflakeId() {
    const timestamp = Date.now().toString(16).padStart(12, '0');
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomString}`;
  }

  /**
   * Convenience: append an empty assistant message and mark it as streaming.
   * Returns the new message id so callers can track it if needed.
   */
  addAssistantStreaming(): string {
    return this.add({
      content: '',
      type: ChatMessageType.Assistant,
      metadata: { streaming: true }
    });
  }

  /**
   * Convenience: update the last message with new streaming content.
   * Preserves streaming=true unless explicitly disabled by endAssistantStreaming().
   */
  updateAssistantStreaming(content: string) {
    this.updateLast({ content, metadata: { streaming: true } });
  }

  /**
   * Convenience: mark the last message streaming=false.
   */
  endAssistantStreaming() {
    this.updateLast({ metadata: { streaming: false } });
  }

  updateLast(data?: Partial<Pick<ChatMessage, 'content' | 'metadata'>>) {
    if (data.content) {
      this.messages[this.messages.length - 1].content = data.content;
    }
    if (data.metadata) {
      this.messages[this.messages.length - 1].metadata = {
        ...this.messages[this.messages.length - 1].metadata,
        ...data.metadata
      };
    }

    this.notifyListeners(ChatHistoryEvent.MessagesChanged);
  }

  /**
   * Replace current messages with normalized server history (session-local view).
   */
  hydrateFromServer(messages: Array<{ role: 'user' | 'assistant'; content: string }>) {
    this._messages.length = 0;
    for (const m of messages) {
      this.add({
        content: m.content,
        type: m.role === 'assistant' ? ChatMessageType.Assistant : ChatMessageType.User,
        metadata: {}
      });
    }
  }

  /**
   * Merge provided metadata keys into current metadata and notify.
   */
  mergeMetadata(metadata: Record<string, unknown>) {
    this._metadata = { ...(this._metadata || {}), ...(metadata || {}) };
    this.notifyListeners(ChatHistoryEvent.MetadataChanged);
  }

  clear(): void {
    this._messages.length = 0;
    // this.copilot.notifyListeners(CopilotEvent.MessagesChanged);
  }

  removeLast(): void {
    this._messages.pop();
  }

  toJSON() {
    return {
      history: this._messages,
      metadata: this._metadata
    };
  }

  static fromJSON(json: any) {
    return new ChatHistory(json?.history, json?.metadata);
  }
}

export interface CreateNodeFileOptions {
  nodeId: string;
  templateId: string;
}
