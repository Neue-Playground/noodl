import { AiAssistantModel } from '@noodl-models/AiAssistant';
import { Ai } from '@noodl-models/AiAssistant/api';
import { ChatMessageType } from '@noodl-models/AiAssistant/ChatHistory';
import { LocalUserIdentity } from '@noodl-utils/LocalUserIdentity';

import { NodeGraphEditor } from '../nodegrapheditor';
import { copilotNodeCommands, copilotNodeInstaPromptable } from './ClippyCommandsMetadata';
import { handleImageCommand } from './Commands/ImageCommand';
import { handleSuggestionCommand } from './Commands/SuggestCommand';
import { handleUICommand } from './Commands/UICommand';

export type CommandResultItem = {
  name: string;
  description: string;
  prompt: string;
};

export interface CommandHandlerOptions {
  nodeGraph: NodeGraphEditor;
}

export async function handleCommand(
  command: string,
  prompt: string,
  options: CommandHandlerOptions,
  statusCallback: (string) => void
): Promise<CommandResultItem[] | void> {
  console.log(command, prompt);
  console.log(options.nodeGraph);
  if (command === '/ui') {
    return await handleUICommand(prompt, statusCallback, {
      allowImageGeneration: true, //TODO: check if AI image generation is enabled
      allowImageNode: true,
      nodeGraphModel: options.nodeGraph.model
    });
  } else if (copilotNodeInstaPromptable.includes(command)) {
    const item = copilotNodeCommands.find((x) => x.title.toLowerCase() === command);
    if (!item) throw new Error('Invalid command');
    const templateId = item.templateId;

    const panAndScale = options.nodeGraph.getPanAndScale();

    const x = Math.round(Math.random() * 100 + 50);
    const y = Math.round(Math.random() * 100 + 50);

    const scaledPos = {
      x: x / panAndScale.scale - panAndScale.x,
      y: y / panAndScale.scale - panAndScale.y
    };

    const context = await AiAssistantModel.instance.createNode(templateId, null, scaledPos);
    context.chatHistory.add({
      content: prompt,
      metadata: {
        user: LocalUserIdentity.getUserInfo()
      }
    });

    statusCallback('Processing...');
    await AiAssistantModel.instance.send(context);

    return;
  } else if (command === '/image') {
    return await handleImageCommand(prompt, statusCallback);
  } else if (command === '/suggest') {
    return await handleSuggestionCommand(prompt, statusCallback);
  } else if (command === '/chat' || command === '/ask') {
    return await handleGeneralChatCommand(prompt, statusCallback);
  }
}

async function handleGeneralChatCommand(prompt: string, statusCallback: (string) => void) {
  statusCallback('Opening AI chat...');

  // Add user message to global chat
  AiAssistantModel.instance.addGlobalChatMessage({
    type: ChatMessageType.User,
    content: prompt,
    metadata: {
      user: LocalUserIdentity.getUserInfo()
    }
  });

  const response = await Ai.chat({
    messages: AiAssistantModel.instance.globalChatHistory.messages.map((m) => ({ role: m.type, content: m.content }))
  });

  AiAssistantModel.instance.addGlobalChatMessage({
    type: ChatMessageType.Assistant,
    content: response
  });

  statusCallback('AI chat opened. Use the chat panel to continue the conversation.');

  return;
}
