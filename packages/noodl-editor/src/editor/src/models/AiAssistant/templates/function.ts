import { ChatMessageType } from '@noodl-models/AiAssistant/ChatHistory';
import { AiNodeTemplate } from '@noodl-models/AiAssistant/interfaces';

import { ToastLayer } from '../../../views/ToastLayer/ToastLayer';
import { chatStream as cloudChatStream } from '../cloud/CloudAiClient';
import { conversationStore } from '../conversationStore';
import { parseAIResponse } from './helper';

export const template: AiNodeTemplate = {
  type: 'pink',
  name: 'JavaScriptFunction',
  nodeDisplayName: 'Function Generator',
  onMessage: async (context) => {
    const activityId = 'processing';
    context.chatHistory.addActivity({ id: activityId, name: 'Processing' });

    try {
      const lastUserMsg = [...context.chatHistory.messages]
        .reverse()
        .find((m) => m.type === 'user' || m.metadata?.user);
      const prompt = lastUserMsg?.content || '';
      if (!prompt) throw new Error('No user prompt provided to function generator');

      context.chatHistory.addAssistantStreaming();

      let label = '';
      let explain = '';
      let collectedCode = '';
      let conversation;
      let streamingError: string | null = null;

      const existingConversationId = conversationStore.getConversationIdForNode(context.node.id);

      await cloudChatStream({
        templateId: 'function',
        userPrompt: prompt,
        conversationId: existingConversationId,
        signal: context.abortController.signal,

        onChunk(chunk) {
          if (streamingError) return;

          switch (chunk.type) {
            case 'label':
              label += chunk.content;
              context.chatHistory.updateAssistantStreaming(`${label}\n${explain}`);
              break;

            case 'explain':
              explain += chunk.content;
              context.chatHistory.updateAssistantStreaming(`${label}\n${explain}`);
              break;

            case 'code':
              collectedCode += chunk.content;
              break;

            case 'conversation':
              conversation = chunk.content;
              break;

            case 'done':
              break;

            case 'error':
              streamingError = chunk.error || 'Unknown AI error';
              break;

            default:
              console.warn('Unexpected chunk type:', chunk);
          }
        }
      });

      if (streamingError) throw new Error(streamingError);

      // Cleanup label + explanation
      label = label.replace(/\s+/g, ' ').trim();
      explain = explain.trim();

      // Remove markdown code fence from collectedCode if present
      let finalCode = collectedCode.trim();
      if (finalCode.startsWith('```javascript')) {
        finalCode = finalCode.substring(12);
      } else if (finalCode.startsWith('```js')) {
        finalCode = finalCode.substring(5);
      } else if (finalCode.startsWith('```')) {
        finalCode = finalCode.substring(3);
      }
      if (finalCode.endsWith('```')) {
        finalCode = finalCode.substring(0, finalCode.length - 3);
      }
      finalCode = finalCode.trim();
      if (!finalCode) throw new Error('No function code generated');

      // Validate code
      try {
        new Function(finalCode);
      } catch {
        throw new Error('Generated JavaScript contains syntax errors');
      }

      context.node.setParameter('functionScript', finalCode);

      if (!existingConversationId && conversation?.conversationId) {
        conversationStore.linkConversationToNode(context.node.id, conversation.conversationId);
      }

      context.chatHistory.updateAssistantStreaming(`**${label}**\n\n${explain}`);
      context.chatHistory.endAssistantStreaming();
      context.chatHistory.clearActivities();
    } catch (err) {
      context.chatHistory.updateAssistantStreaming(`Error: ${err.message}`);
      context.chatHistory.endAssistantStreaming();
      ToastLayer.showError(err.message || 'Failed to generate function');
      context.chatHistory.clearActivities();
    }
  }
};
