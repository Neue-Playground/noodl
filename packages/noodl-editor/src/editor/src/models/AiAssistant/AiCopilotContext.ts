import { AiTemplate } from '@noodl-models/AiAssistant/AiAssistantModel';
import { ChatHistory } from '@noodl-models/AiAssistant/ChatHistory';
import { IAiCopilotContext } from '@noodl-models/AiAssistant/interfaces';
import { NodeGraphNode } from '@noodl-models/nodegraphmodel';

export class AiCopilotContext implements IAiCopilotContext {
  public readonly abortController = new AbortController();

  constructor(
    public readonly template: AiTemplate,
    public readonly chatHistory: ChatHistory,
    public readonly node: NodeGraphNode
  ) {}

  toObject(): IAiCopilotContext {
    return {
      template: this.template,
      chatHistory: this.chatHistory,
      node: this.node
    };
  }
}
