import { AiNodeTemplate } from '@noodl-models/AiAssistant/interfaces';

import { ToastLayer } from '../../../views/ToastLayer/ToastLayer';
import { chatStream as cloudChatStream } from '../cloud/CloudAiClient';
import { conversationStore } from '../conversationStore';

export const template: AiNodeTemplate = {
  type: 'pink',
  name: 'Javascript2',
  nodeDisplayName: 'Simulator',
  onMessage: async (context) => {
    const activityId = 'processing';
    context.chatHistory.addActivity({ id: activityId, name: 'Processing' });

    try {
      const lastUserMsg = [...context.chatHistory.messages]
        .reverse()
        .find((m) => m.type === 'user' || m.metadata?.user);
      const prompt = lastUserMsg?.content || '';
      if (!prompt) throw new Error('No user prompt provided to simulator generator');

      context.chatHistory.addAssistantStreaming();

      let label = '';
      let explain = '';
      let collectedCode = '';
      let conversation;
      let streamingError: string | null = null;

      const existingConversationId = conversationStore.getConversationIdForNode(context.node.id);
      console.log('Existing conversation ID for node:', existingConversationId);

      await cloudChatStream({
        templateId: 'simulator',
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
      finalCode = finalCode.replace(/^```[a-zA-Z]*\n/, '');
      finalCode = finalCode.replace(/```$/, '');
      finalCode = finalCode.trim();

      if (!finalCode) throw new Error('No simulator code generated');

      // Validate code
      try {
        new Function(finalCode);
      } catch {
        throw new Error('Generated simulator contains syntax errors');
      }

      context.node.setLabel(label || 'Simulator');
      context.node.setParameter('code', finalCode);

      if (!existingConversationId && conversation) {
        conversationStore.linkConversationToNode(context.node.id, conversation);
        console.log('New conversation ID for node:', conversation);
      }

      context.chatHistory.updateAssistantStreaming(`**${label}**\n\n${explain}`);
      context.chatHistory.endAssistantStreaming();
      context.chatHistory.clearActivities();
    } catch (err) {
      context.chatHistory.updateAssistantStreaming(`Error: ${err.message}`);
      context.chatHistory.endAssistantStreaming();
      ToastLayer.showError(err.message || 'Failed to generate simulator');
      context.chatHistory.clearActivities();
    }
  }
};
