import { AiTemplate } from './AiAssistantModel';
import { ChatHistory } from './ChatHistory';
import { NodeGraphNode } from '@noodl-models/nodegraphmodel';
import { IAiCopilotContext } from './interfaces';

export class AiCopilotContext {
  template: AiTemplate;
  chatHistory: ChatHistory;
  node: NodeGraphNode;
  abortController: AbortController;

  constructor(template: AiTemplate, chatHistory: ChatHistory, node: NodeGraphNode) {
    this.template = template;
    this.chatHistory = chatHistory;
    this.node = node;
    this.abortController = new AbortController();
  }

  toObject(): IAiCopilotContext {
    // For compatibility, return this instance typed as IAiCopilotContext.
    return (this as unknown) as IAiCopilotContext;
  }
}
