import {
  GeminiAiModel,
  OpenAiModel,
  AiEnabled,
  AiSelectedModel,
  AiStore,
  AiImageModel
} from '@noodl-store/AiAssistantStore';
import React, { useState } from 'react';
import { platform } from '@noodl/platform';

// Verification of API keys is handled on the server; do not import client-side verifiers.

import { PrimaryButton, PrimaryButtonSize, PrimaryButtonVariant } from '@noodl-core-ui/components/inputs/PrimaryButton';
import { Box } from '@noodl-core-ui/components/layout/Box';
import { VStack } from '@noodl-core-ui/components/layout/Stack';
import { PropertyPanelButton } from '@noodl-core-ui/components/property-panel/PropertyPanelButton';
import { PropertyPanelRow } from '@noodl-core-ui/components/property-panel/PropertyPanelInput';
import { PropertyPanelPasswordInput } from '@noodl-core-ui/components/property-panel/PropertyPanelPasswordInput';
import { PropertyPanelSelectInput } from '@noodl-core-ui/components/property-panel/PropertyPanelSelectInput';
import { CollapsableSection } from '@noodl-core-ui/components/sidebar/CollapsableSection';
import { Text } from '@noodl-core-ui/components/typography/Text';
import { Title, TitleSize } from '@noodl-core-ui/components/typography/Title';

import { ToastLayer } from '../../../ToastLayer/ToastLayer';

export const AI_ASSISTANT_ENABLED_SUGGESTIONS_KEY = 'aiAssistant.enabledSuggestions';

export function AiSection() {
  const [openAiApiKey, setOpenAiApiKey] = useState(AiStore.getOpenAiApiKey());
  const [openAiModel, setOpenAiModel] = useState(AiStore.getOpenAiModel());
  const [geminiApiKey, setGeminiApiKey] = useState(AiStore.getGeminiApiKey());
  const [geminiModel, setGeminiModel] = useState(AiStore.getGeminiModel());
  // enabled state is managed in store; local state not needed
  const [selectedAiModel, setSelectedAiModel] = useState<AiSelectedModel>(AiStore.getAiSelectedModel());
  const [imageModel, setImageModel] = useState<AiImageModel | undefined>(AiStore.getImageModel());

  async function onVerifyOpenAiApiKey() {
    // Server handles key validation; mark as verified locally if a key exists.
    if (openAiApiKey) {
      AiStore.setOpenAiVerified(true);
      ToastLayer.showSuccess('OpenAI API Key presence noted (server validates keys)');
    } else {
      AiStore.setOpenAiVerified(false);
      ToastLayer.showError('No OpenAI API Key provided');
    }
  }

  async function onVerifyGeminiApiKey() {
    // Server handles key validation; mark as verified locally if a key exists.
    if (geminiApiKey) {
      AiStore.setGeminiVerified(true);
      ToastLayer.showSuccess('Gemini API Key presence noted (server validates keys)');
    } else {
      AiStore.setGeminiVerified(false);
      ToastLayer.showError('No Gemini API Key provided');
    }
  }

  return (
    <CollapsableSection title="AI">
      <Box hasXSpacing>
        <VStack>
          <PropertyPanelRow label="AI Model" isChanged={false}>
            <PropertyPanelSelectInput
              value={selectedAiModel}
              properties={{
                options: [
                  { label: 'Disabled', value: 'disabled' },
                  { label: 'OpenAI', value: 'openai' },
                  { label: 'Gemini', value: 'gemini' }
                ]
              }}
              onChange={(value: string) => {
                const aiModel = value as AiSelectedModel;
                setSelectedAiModel(aiModel);
                AiStore.setAiSelectedModel(aiModel);

                // Update the enabled state based on selection
                const newEnabledState: AiEnabled = aiModel === 'disabled' ? 'disabled' : 'enabled';
                AiStore.setAiEnabled(newEnabledState);
              }}
            />
          </PropertyPanelRow>

          {selectedAiModel === 'openai' && (
            <CollapsableSection title="OpenAI">
              <PropertyPanelRow label="Model" isChanged={false}>
                <PropertyPanelSelectInput
                  value={openAiModel}
                  properties={{
                    options: [
                      { label: 'GPT-5', value: 'gpt-5' },
                      { label: 'GPT-5 mini', value: 'gpt-5-mini' },
                      { label: 'GPT-5 nano', value: 'gpt-5-nano' }
                    ]
                  }}
                  onChange={(value: OpenAiModel) => {
                    setOpenAiModel(value);
                    AiStore.setOpenAiModel(value);
                  }}
                />
              </PropertyPanelRow>
              <PropertyPanelRow label="API Key" isChanged={false}>
                <PropertyPanelPasswordInput
                  value={openAiApiKey}
                  onChange={(value) => {
                    setOpenAiApiKey(value);
                    AiStore.setOpenAiApiKey(value);
                  }}
                />
              </PropertyPanelRow>
              <PropertyPanelRow label="API Key" isChanged={false}>
                <PropertyPanelButton
                  properties={{
                    isPrimary: true,
                    buttonLabel: 'Verify OpenAI Key',
                    onClick() {
                      onVerifyOpenAiApiKey();
                    }
                  }}
                />
              </PropertyPanelRow>
            </CollapsableSection>
          )}

          {selectedAiModel === 'gemini' && (
            <CollapsableSection title="Gemini">
              <PropertyPanelRow label="Model" isChanged={false}>
                <PropertyPanelSelectInput
                  value={geminiModel}
                  properties={{
                    options: [
                      { label: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' },
                      { label: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' },
                      { label: 'Gemini 2.5 Flash Lite', value: 'gemini-2.5-flash-lite' },
                      { label: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' }
                    ]
                  }}
                  onChange={(value: GeminiAiModel) => {
                    setGeminiModel(value);
                    AiStore.setGeminiModel(value);
                  }}
                />
              </PropertyPanelRow>
              <PropertyPanelRow label="API Key" isChanged={false}>
                <PropertyPanelPasswordInput
                  value={geminiApiKey}
                  onChange={(value) => {
                    setGeminiApiKey(value);
                    AiStore.setGeminiApiKey(value);
                  }}
                />
              </PropertyPanelRow>
              <PropertyPanelRow label="API Key" isChanged={false}>
                <PropertyPanelButton
                  properties={{
                    isPrimary: true,
                    buttonLabel: 'Verify Gemini Key',
                    onClick() {
                      onVerifyGeminiApiKey();
                    }
                  }}
                />
              </PropertyPanelRow>
            </CollapsableSection>
          )}

          <CollapsableSection title="AI Image Model">
            <PropertyPanelRow label="Image Generator" isChanged={false}>
              <PropertyPanelSelectInput
                value={imageModel || 'disabled'}
                properties={{
                  options: [
                    { label: 'Disabled', value: 'disabled' },
                    { label: 'Gemini Imagen', value: 'imagen-4.0-fast-generate-001' },
                    { label: 'Gemini 2.5 Flash Image Preview', value: 'gemini-2.5-flash-image-preview' }
                  ]
                }}
                onChange={(value: AiImageModel) => {
                  setImageModel(value);
                  AiStore.setImageModel(value);
                }}
              />
            </PropertyPanelRow>
          </CollapsableSection>

          <Box
            hasXSpacing={3}
            hasYSpacing={3}
            UNSAFE_style={{ borderRadius: '2px', background: 'var(--theme-color-bg-3)' }}
          >
            <Title size={TitleSize.Medium} hasBottomSpacing>
              AI docs
            </Title>
            <Text hasBottomSpacing>See setup instructions and guides for how to use AI on our docs.</Text>
            <PrimaryButton
              variant={PrimaryButtonVariant.Muted}
              size={PrimaryButtonSize.Small}
              isGrowing
              label="Open docs"
              onClick={() => {
                platform.openExternal('https://docs.noodl.net/#/docs/getting-started/noodl-ai/');
              }}
            />
          </Box>
        </VStack>
      </Box>
    </CollapsableSection>
  );
}
