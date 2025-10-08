import {
  GeminiAiModel,
  OpenAiModel,
  AiEnabled,
  AiSelectedModel,
  OpenAiStore,
  AiImageModel,
  BytezAiModel
} from '@noodl-store/AiAssistantStore';
import React, { useState } from 'react';
import { platform } from '@noodl/platform';

import { verifyOpenAiApiKey, verifyGeminiApiKey } from '@noodl-models/AiAssistant/api';

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

export function OpenAiSection() {
  const [openAiApiKey, setOpenAiApiKey] = useState(OpenAiStore.getOpenAiApiKey());
  const [openAiModel, setOpenAiModel] = useState(OpenAiStore.getOpenAiModel());
  const [geminiApiKey, setGeminiApiKey] = useState(OpenAiStore.getGeminiApiKey());
  const [geminiModel, setGeminiModel] = useState(OpenAiStore.getGeminiModel());
  // enabled state is managed in store; local state not needed
  const [selectedAiModel, setSelectedAiModel] = useState<AiSelectedModel>(OpenAiStore.getAiSelectedModel());
  const [imageModel, setImageModel] = useState<AiImageModel | undefined>(OpenAiStore.getImageModel());
  const [bytezApiKey, setBytezApiKey] = useState(OpenAiStore.getBytezApiKey());
  const [bytezModel, setBytezModel] = useState<BytezAiModel>(OpenAiStore.getBytezModel());

  async function onVerifyOpenAiApiKey() {
    const models = await verifyOpenAiApiKey(openAiApiKey);
    if (models) {
      OpenAiStore.setOpenAiVerified(true);
      ToastLayer.showSuccess('OpenAI API Key is valid');
    } else {
      OpenAiStore.setOpenAiVerified(false);
      ToastLayer.showError('OpenAI API Key is invalid!');
    }
  }

  async function onVerifyGeminiApiKey() {
    const isValid = await verifyGeminiApiKey(geminiApiKey);
    if (isValid) {
      OpenAiStore.setGeminiVerified(true);
      ToastLayer.showSuccess('Gemini API Key is valid!');
    } else {
      OpenAiStore.setGeminiVerified(false);
      ToastLayer.showError('Gemini API Key is invalid!');
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
                  { label: 'Gemini', value: 'gemini' },
                  { label: 'Bytez', value: 'bytez' }
                ]
              }}
              onChange={(value: string) => {
                const aiModel = value as AiSelectedModel;
                setSelectedAiModel(aiModel);
                OpenAiStore.setAiSelectedModel(aiModel);

                // Update the enabled state based on selection
                const newEnabledState: AiEnabled = aiModel === 'disabled' ? 'disabled' : 'enabled';
                OpenAiStore.setAiEnabled(newEnabledState);
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
                    OpenAiStore.setOpenAiModel(value);
                  }}
                />
              </PropertyPanelRow>
              <PropertyPanelRow label="API Key" isChanged={false}>
                <PropertyPanelPasswordInput
                  value={openAiApiKey}
                  onChange={(value) => {
                    setOpenAiApiKey(value);
                    OpenAiStore.setOpenAiApiKey(value);
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
                    OpenAiStore.setGeminiModel(value);
                  }}
                />
              </PropertyPanelRow>
              <PropertyPanelRow label="API Key" isChanged={false}>
                <PropertyPanelPasswordInput
                  value={geminiApiKey}
                  onChange={(value) => {
                    setGeminiApiKey(value);
                    OpenAiStore.setGeminiApiKey(value);
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

          {selectedAiModel === 'bytez' && (
            <CollapsableSection title="Bytez">
              <PropertyPanelRow label="Chat Model" isChanged={false}>
                <PropertyPanelSelectInput
                  value={bytezModel}
                  properties={{
                    options: [
                      {
                        label: 'Deepseek-R1 (Qwen-1.5B distilled)',
                        value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B'
                      },
                      { label: 'Phi-3-mini (128k instruct)', value: 'microsoft/Phi-3-mini-128k-instruct' }
                    ]
                  }}
                  onChange={(value: BytezAiModel) => {
                    setBytezModel(value);
                    OpenAiStore.setBytezModel(value);
                  }}
                />
              </PropertyPanelRow>
              <PropertyPanelRow label="API Key" isChanged={false}>
                <PropertyPanelPasswordInput
                  value={bytezApiKey}
                  onChange={(value) => {
                    setBytezApiKey(value);
                    OpenAiStore.setBytezApiKey(value);
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
                    { label: 'Gemini 2.5 Flash Image Preview', value: 'gemini-2.5-flash-image-preview' },
                    {
                      label: 'Playground v2.5 (Bytez, 1024px aesthetic)',
                      value: 'playgroundai/playground-v2.5-1024px-aesthetic'
                    }
                  ]
                }}
                onChange={(value: AiImageModel) => {
                  setImageModel(value);
                  OpenAiStore.setImageModel(value);
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
