import { NodeGraphContextTmp } from '@noodl-contexts/NodeGraphContext/NodeGraphContext';
import { AiStore } from '@noodl-store/AiAssistantStore';

import { AiAssistantModel } from '@noodl-models/AiAssistant';
import { Ai } from '@noodl-models/AiAssistant/api';
import { getType, suggestPrimer } from './suggest-primer';

export async function handleSuggestionCommand(prompt: string, statusCallback: (status: string) => void) {
  statusCallback('Generating suggestions...');

  const nodeGraphModel = NodeGraphContextTmp.nodeGraph.model;

  const json = nodeGraphModel.toJSON().roots;

  const group = json.find((x) => x.type === 'Group' || x.type === 'Page');
  if (!group) {
    return;
  }

  function cleanNodes(node) {
    let children;
    if (node.children) {
      children = [];
      for (const c of node.children) {
        children.push(cleanNodes(c));
      }
    }

    return {
      type: getType(node.type),
      children: children,
      parameters: node.parameters
    };
  }

  const cleanNode = cleanNodes(group);

  const p = `
  Suggest ${prompt}
  
  UI:
  ${JSON.stringify(cleanNode, null, 2)}
  `;

  const messages = [
    { role: 'system', content: suggestPrimer },
    { role: 'user', content: p }
  ];

  // AiAssistantModel.instance.addGlobalChatMessage({ type: ChatMessageType.User, content: p });

  const stream = await Ai.chatStream({
    messages,
    provider: { model: AiStore.getOpenAiModel() }
  });

  let responseContent = '';
  for await (const chunk of stream) {
    responseContent += chunk;
    AiAssistantModel.instance.setGlobalChatStreamingContent(responseContent);
  }

  AiAssistantModel.instance.setGlobalChatStreamingContent('');
  // AiAssistantModel.instance.addGlobalChatMessage({ type: ChatMessageType.Assistant, content: responseContent });

  console.log(responseContent);

  return JSON.parse(responseContent);
}
