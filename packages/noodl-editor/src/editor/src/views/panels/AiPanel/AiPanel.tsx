import { useModernModel } from '@noodl-hooks/useModel';
import { AiStore } from '@noodl-store/AiAssistantStore';
import React, { useState } from 'react';

import { AiAssistantEvent, AiAssistantModel } from '@noodl-models/AiAssistant/AiAssistantModel';
import { ChatMessageType } from '@noodl-models/AiAssistant/ChatHistory';
import { LocalUserIdentity } from '@noodl-utils/LocalUserIdentity';
import { tracker } from '@noodl-utils/tracker';

import { AiChatBox } from '@noodl-core-ui/components/ai/AiChatBox';
import { AiChatMessage } from '@noodl-core-ui/components/ai/AiChatMessage';
import { PrimaryButton, PrimaryButtonSize } from '@noodl-core-ui/components/inputs/PrimaryButton';
import { TextArea } from '@noodl-core-ui/components/inputs/TextArea';
import { Center } from '@noodl-core-ui/components/layout/Center';
import { VStack } from '@noodl-core-ui/components/layout/Stack';
import { Text, TextType } from '@noodl-core-ui/components/typography/Text';

import { handleUICommand } from '../../Clippy/Commands/UICommand';

export function AiPanel() {
  useModernModel(AiAssistantModel.instance, [
    AiAssistantEvent.GlobalChatNewMessage,
    AiAssistantEvent.GlobalChatStreaming
  ]);

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messages = AiAssistantModel.instance.globalChatHistory.messages;
  const streamingContent = AiAssistantModel.instance.globalChatStreamingContent;

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    // Add user message to global chat
    AiAssistantModel.instance.addGlobalChatMessage({
      type: ChatMessageType.User,
      content: userMessage,
      metadata: {
        user: LocalUserIdentity.getUserInfo()
      }
    });

    // Track the message
    tracker.track('AI Panel Chat Message', {
      prompt: userMessage,
      messages: messages.length
    });

    try {
      await handleUICommand(userMessage, (status) => {
        AiAssistantModel.instance.setGlobalChatStreamingContent(status);
      });
    } catch (error) {
      console.error('Error sending message:', error);
      AiAssistantModel.instance.addGlobalChatMessage({
        type: ChatMessageType.Assistant,
        content: `Error: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnter = () => {
    handleSendMessage();
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: 'white', fontWeight: '600' }}>AI Assistant</h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'white' }}>
          Chat with AI to get help with your project
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <AiChatBox
          footer={
            AiStore.getAiEnabled() === 'disabled' ? (
              <Center>
                <Text textType={TextType.Shy}>AI is currently disabled.</Text>
              </Center>
            ) : (
              <>
                <TextArea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask AI anything..."
                  hasBottomSpacing
                  isResizeDisabled
                  onEnter={handleEnter}
                  UNSAFE_style={{ minHeight: '72px', fontSize: '12px' }}
                />
                <VStack hasSpacing={1}>
                  <PrimaryButton
                    label={isLoading ? 'Sending...' : 'Send Message'}
                    size={PrimaryButtonSize.Small}
                    isGrowing
                    isDisabled={!message.trim() || isLoading}
                    onClick={handleSendMessage}
                  />
                </VStack>
              </>
            )
          }
        >
          {messages.map((message) => (
            <AiChatMessage
              key={message.snowflakeId}
              user={
                message.type === 'assistant'
                  ? {
                      role: 'assistant'
                    }
                  : {
                      role: 'user',
                      name: (message.metadata?.user as { name: string })?.name || LocalUserIdentity.getUserInfo().name
                    }
              }
              content={message.content}
            />
          ))}
          {streamingContent && (
            <AiChatMessage
              user={{
                role: 'assistant'
              }}
              content={streamingContent}
            />
          )}
        </AiChatBox>
      </div>
    </div>
  );
}
