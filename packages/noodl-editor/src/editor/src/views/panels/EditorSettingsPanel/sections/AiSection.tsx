import { GeminiAiModel, AiEnabled, AiSelectedModel, AiStore, AiImageModel } from '@noodl-store/AiAssistantStore';
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
  const [geminiModel, setGeminiModel] = useState(AiStore.getGeminiModel());
  // enabled state is managed in store; local state not needed
  const [selectedAiModel, setSelectedAiModel] = useState<AiSelectedModel>(AiStore.getAiSelectedModel());
  const [imageModel, setImageModel] = useState<AiImageModel | undefined>(AiStore.getImageModel());

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
                    { label: 'Gemini 2.5 Flash Image', value: 'gemini-2.5-flash-image' }
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
