// import Store from 'electron-store';

import { EditorSettings } from '@noodl-utils/editorsettings';

const AI_ASSISTANT_API_KEY = 'aiAssistant.temporaryApiKey';
const AI_ASSISTANT_VERSION_KEY = 'aiAssistant.version';
const AI_ASSISTANT_VERIFIED_KEY = 'aiAssistant.verified';
const AI_ASSISTANT_ENDPOINT_KEY = 'aiAssistant.endpoint';
const AI_ASSISTANT_MODEL_KEY = 'aiAssistant.model';

export type AiVersion = 'disabled' | 'gpt-4o' | 'enterprise';

export type AiModel = 'gpt-4o';

export const OpenAiStore = {
  isEnabled(): boolean {
    const version = EditorSettings.instance.get(AI_ASSISTANT_VERSION_KEY);
    return version === 'gpt-4o';
  },
  getVersion(): AiVersion {
    return EditorSettings.instance.get(AI_ASSISTANT_VERSION_KEY) || 'gpt-4o';
  },
  getPrettyVersion(): string {
    switch (this.getVersion()) {
      case 'gpt-4o':
        return 'GPT-4o';
      case 'enterprise':
        return 'Enterprise';
    }
    return null;
  },
  setVersion(value: AiVersion): void {
    EditorSettings.instance.set(AI_ASSISTANT_VERSION_KEY, value);
  },

  getApiKey() {
    return EditorSettings.instance.get(AI_ASSISTANT_API_KEY);
  },
  async setApiKey(value: string) {
    EditorSettings.instance.set(AI_ASSISTANT_API_KEY, value);
  },
  setIsAiApiKeyVerified(value: boolean) {
    EditorSettings.instance.set(AI_ASSISTANT_VERIFIED_KEY, value);
  },
  getIsAiApiKeyVerified() {
    return !!EditorSettings.instance.get(AI_ASSISTANT_VERIFIED_KEY);
  },
  setEndpoint(value: string) {
    EditorSettings.instance.set(AI_ASSISTANT_ENDPOINT_KEY, value);
  },
  getEndpoint() {
    return EditorSettings.instance.get(AI_ASSISTANT_ENDPOINT_KEY);
  },
  setModel(value: AiModel) {
    EditorSettings.instance.set(AI_ASSISTANT_MODEL_KEY, value);
  },
  getModel(): AiModel {
    return EditorSettings.instance.get(AI_ASSISTANT_MODEL_KEY);
  }
};
