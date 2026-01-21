import { AiNodeTemplate } from '@noodl-models/AiAssistant/interfaces';
import { ConnectionInspector } from '@noodl-utils/connectionInspector';
import { LocalUserIdentity } from '@noodl-utils/LocalUserIdentity';

import { ChatMessageType } from '../ChatHistory';
import { chatStream as cloudChatStream } from '../cloud/CloudAiClient';
import { conversationStore } from '../conversationStore';
import { extractCodeBlock } from './helper';

export const template: AiNodeTemplate = {
  type: 'blue',
  name: 'noodl.chart-js.chart',
  onMessage: async ({ node, chatHistory }) => {
    const activityId = 'processing';
    const activityCodeGenId = 'code-generation';

    chatHistory.addActivity({
      id: activityId,
      name: 'Processing'
    });

    // ---
    // Generate the code

    chatHistory.addActivity({
      id: activityCodeGenId,
      name: 'Generating code...'
    });

    const data = await ConnectionInspector.instance.getConnectionValue(node, 'input', 'data');
    console.log('fullData', data);

    const shortData = Array.isArray(data) ? data.slice(0, 3) : data;
    const shortDataJson = JSON.stringify(shortData);
    console.log('data', shortDataJson);

    const currentScript = node.getParameter('functionScript');
    // Build minimal prompt and context for cloud agent
    const lastUserMsg = [...chatHistory.messages].reverse().find((m) => m.type === 'user' || m.metadata?.user);
    const userPrompt = lastUserMsg ? lastUserMsg.content : '';

    if (!userPrompt) {
      throw new Error('No user prompt provided to chart generator');
    }

    const userInfo = LocalUserIdentity.getUserInfo();
    const userId = userInfo?.id || 'local';

    // Create a placeholder assistant message to stream into
    chatHistory.add({
      content: '',
      type: ChatMessageType.Assistant,
      metadata: { streaming: true }
    });

    const existingConversationId = conversationStore.getConversationIdForNode(node.id) || undefined;
    const { fullText: fullCodeText, conversation } = await cloudChatStream({
      userId,
      templateId: 'chart',
      userPrompt,
      conversationId: existingConversationId,
      context: {
        data: shortData,
        currentScript
      },
      onStream(fullText) {
        chatHistory.updateLast({ content: fullText, metadata: { streaming: true } });
      }
    });

    if (!existingConversationId && conversation) {
      conversationStore.linkConversationToNode(node.id, conversation);
    }

    const codeText = extractCodeBlock(fullCodeText);
    if (codeText) {
      node.setParameter('functionScript', codeText);
    }

    // Mark streaming complete on the assistant message
    chatHistory.updateLast({ metadata: { streaming: false } });

    chatHistory.removeActivity(activityCodeGenId);
    chatHistory.removeActivity(activityId);
  }
};

// Prompts moved to cloud: chart template resolved by passing templateId='chart'
