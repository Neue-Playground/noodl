import { AiAssistantModel } from '@noodl-models/AiAssistant';
import { ChatMessageType } from '@noodl-models/AiAssistant/ChatHistory';

import { CloudAiClient } from '../../models/AiAssistant/cloud/CloudAiClient';
import { NodeGraphEditor } from '../nodegrapheditor';
import { copilotNodeCommands, copilotNodeInstaPromptable } from './ClippyCommandsMetadata';
import { handleImageCommand } from './Commands/ImageCommand';
import { handleUICommand } from './Commands/UICommand';

export type CommandResultItem = {
  name: string;
  description: string;
  prompt: string;
};

export async function handleCommand(
  command: string,
  prompt: string,
  nodeGraph: NodeGraphEditor,
  statusCallback: (string) => void
): Promise<CommandResultItem[] | void> {
  console.log(command, prompt);
  console.log(nodeGraph);
  if (command === '/ui') {
    return await handleUICommand(prompt, statusCallback, nodeGraph.model);
  } else if (copilotNodeInstaPromptable.includes(command)) {
    const item = copilotNodeCommands.find((x) => x.title.toLowerCase() === command);
    if (!item) throw new Error('Invalid command');
    const templateId = item.templateId;

    const panAndScale = nodeGraph.getPanAndScale();

    const x = Math.round(Math.random() * 100 + 50);
    const y = Math.round(Math.random() * 100 + 50);

    const scaledPos = {
      x: x / panAndScale.scale - panAndScale.x,
      y: y / panAndScale.scale - panAndScale.y
    };

    const context = await AiAssistantModel.instance.createNode(templateId, null, scaledPos);
    context.chatHistory.add({
      content: prompt,
      type: ChatMessageType.User,
      metadata: { user: true }
    });

    statusCallback('Processing...');
    await AiAssistantModel.instance.send(context);

    return;
  } else if (command === '/image') {
    return await handleImageCommand(prompt, statusCallback);
  } else if (command === '/chat') {
    return await handleGeneralChatCommand(prompt, statusCallback);
  }
}

async function handleGeneralChatCommand(prompt: string, statusCallback: (string) => void) {
  statusCallback('Opening AI chat...');

  // Add user message to global chat
  AiAssistantModel.instance.addGlobalChatMessage({
    type: ChatMessageType.User,
    content: prompt
  });

  // Send only the new user prompt to the server. Global chat history is kept locally
  // and should not be sent to the cloud — the server maintains its own conversation state.
  const response = await CloudAiClient.chat({
    userPrompt: prompt,
    templateId: 'chat'
  });

  AiAssistantModel.instance.addGlobalChatMessage({
    type: ChatMessageType.Assistant,
    content: typeof response === 'string' ? response : JSON.stringify(response)
  });

  statusCallback('AI chat opened. Use the chat panel to continue the conversation.');

  return;
}
