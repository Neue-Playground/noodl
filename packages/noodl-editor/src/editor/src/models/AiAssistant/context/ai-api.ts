import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source';
import { OpenAiStore } from '@noodl-store/AiAssistantStore';

import { AiCopilotChatProviders, AiCopilotChatStreamArgs } from '@noodl-models/AiAssistant/interfaces';

function toChatProvider(provider: AiCopilotChatProviders | undefined) {
  return {
    model: provider?.model,
    temperature: provider?.temperature,
    max_tokens: provider?.max_tokens
  };
}

async function directChatOpenAi({ messages, provider, abortController, onEnd, onStream }: AiCopilotChatStreamArgs) {
  const OPENAI_API_KEY = OpenAiStore.getOpenAiApiKey();
  const controller = abortController || new AbortController();
  const endpoint = `https://api.openai.com/v1/chat/completions`;

  let fullText = '';
  let completionTokenCount = 0;

  let tries = 2;
  await fetchEventSource(endpoint, {
    method: 'POST',
    openWhenHidden: true,
    headers: {
      Authorization: 'Bearer ' + OPENAI_API_KEY,
      'Content-Type': 'application/json'
    },
    signal: controller.signal,
    body: JSON.stringify({
      ...toChatProvider(provider),
      messages,
      stream: true
    }),
    async onopen(response) {
      if (response.ok) {
        return; // everything's good
      } else if (response.status === 429) {
        throw new Error('OpenAI is overloaded or you are being rate limited. Please try again later.');
      } else if (response.status === 401) {
        throw new Error('OpenAI API key is invalid or unauthorized.');
      } else if (response.status === 500 || response.status === 503) {
        throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
      } else if (response.status >= 400 && response.status < 500) {
        throw new Error('OpenAI request failed: ' + response.status + ' ' + response.statusText);
      } else {
        throw new Error('OpenAI server error: ' + response.status + ' ' + response.statusText);
      }
    },
    onmessage(ev) {
      if (ev.data === '[DONE]') {
        controller.abort();
        return;
      }

      try {
        const json = JSON.parse(ev.data);
        const delta = json.choices[0].delta.content;
        if (delta) {
          completionTokenCount++;
          fullText += delta;
          console.debug('[stream]', fullText);
          onStream && onStream(fullText, delta);
        }
      } catch (error) {
        console.error(error);
      }
    },
    onclose() {
      onEnd && onEnd();
    },
    onerror(err) {
      const errText = err.toString();
      if (['FatalError'].includes(errText)) {
        throw err; // rethrow to stop the operation
      } else if (['RetriableError'].includes(errText)) {
        if (tries <= 0) {
          throw new Error(
            'OpenAI is currently facing heavy traffic, causing delays in processing requests. Please be patient and try again later.'
          );
        }
        tries--;
      } else {
        throw new Error('An unknown error occurred while communicating with OpenAI: ' + errText);
      }
    }
  });

  return {
    fullText,
    completionTokenCount
  };
}

export namespace Ai {
  export async function chatStream(args: AiCopilotChatStreamArgs): Promise<string> {
    let fullText = '';
    const result = await directChatOpenAi(args);
    fullText = result.fullText;

    return fullText;
  }
}
