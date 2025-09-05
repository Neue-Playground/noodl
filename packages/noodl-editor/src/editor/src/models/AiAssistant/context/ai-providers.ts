import { Parser } from '@noodl-models/AiAssistant/_backend/parser';
import { Ai } from '@noodl-models/AiAssistant/context/ai-api';
import { AiQuery } from '@noodl-models/AiAssistant/context/ai-query';

export type XmlChatMessage = { role: string; content: string };

export type OpenAiXmlProviderConfig = {
  model: string;
  temperature?: number;
  max_tokens?: number;
};

export type GeminiXmlProviderConfig = {
  apiKey?: string;
  model: string;
};

export type XmlProviderSelector = {
  selectedModel: 'disabled' | 'openai' | 'gemini' | 'bytez';
  openAi: OpenAiXmlProviderConfig;
  gemini: GeminiXmlProviderConfig;
  bytez?: { apiKey?: string; model: string };
};

export type XmlChatCallbacks = {
  onTagOpen?: (tagName: string, attributes: Record<string, string>) => void;
  onTagEnd?: (tagName?: string, fullText?: string) => void;
};

export function getXmlChatProvider(selector: XmlProviderSelector) {
  if (selector.selectedModel === 'disabled') {
    throw new Error('AI is disabled. Please enable an AI model in the editor settings.');
  }

  if (selector.selectedModel === 'openai') {
    return {
      async chatStreamXml({ messages, onTagOpen, onTagEnd }: { messages: XmlChatMessage[] } & XmlChatCallbacks) {
        return AiQuery.chatStreamXml({
          messages,
          provider: {
            model: selector.openAi.model as any,
            temperature: selector.openAi.temperature,
            max_tokens: selector.openAi.max_tokens
          },
          onTagOpen,
          onTagEnd
        });
      }
    };
  }

  if (selector.selectedModel === 'bytez') {
    // Bytez fallback uses a single-shot request and local Parser for XML
    return {
      async chatStreamXml({ messages, onTagOpen, onTagEnd }: { messages: XmlChatMessage[] } & XmlChatCallbacks) {
        const { default: Bytez } = await import('bytez.js');
        if (!selector?.bytez?.apiKey) {
          throw new Error('Bytez is not configured. Please add an API key in settings.');
        }

        const sdk = new Bytez(selector.bytez.apiKey);
        const model = sdk.model(selector.bytez.model);
        await model.create();

        const payload = messages.map((m) => ({ role: m.role as any, content: m.content }));
        const result = await model.run(payload);
        const output = (result?.output as string) || '';

        const parser = new Parser(
          () => {},
          (tag, attrs) => onTagOpen && onTagOpen(tag, attrs),
          (tag, full) => onTagEnd && onTagEnd(tag, full)
        );

        if (output) parser.append(output);
        return output;
      }
    };
  }

  // Gemini fallback uses a single-shot request and local Parser for XML
  return {
    async chatStreamXml({ messages, onTagOpen, onTagEnd }: { messages: XmlChatMessage[] } & XmlChatCallbacks) {
      const { callGeminiApi } = await import('../../AiAssistant/api');
      if (!selector.gemini.apiKey) {
        throw new Error('Gemini is not configured. Please add an API key in settings.');
      }

      const prompt = messages.map((m) => `${m.role}: ${m.content}`).join('\n\n');
      const response = await callGeminiApi(selector.gemini.apiKey, selector.gemini.model, prompt);

      const parser = new Parser(
        () => {},
        (tag, attrs) => onTagOpen && onTagOpen(tag, attrs),
        (tag, full) => onTagEnd && onTagEnd(tag, full)
      );

      if (response) parser.append(response);
      return response;
    }
  };
}
