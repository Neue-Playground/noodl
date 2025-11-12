import * as CloudAiClient from './cloud/CloudAiClient';
import { LocalUserIdentity } from '@noodl-utils/LocalUserIdentity';
import type { ChatRequest, ChatStreamParams, ChatStreamChunk, Conversation } from './interfaces';

// Minimal compatibility shim for legacy `Ai` surface used across the codebase.
// It adapts older shapes (messages arrays, etc.) to the new cloud client.

function messagesToPrompt(messages: Array<{ role?: string; content?: string }>): string {
  return messages
    .map((m) => {
      const role = (m.role || '').toString();
      const content = m.content ?? '';
      return `${role}: ${content}`;
    })
    .join('\n\n');
}

export const Ai = {
  // Old callers often passed { messages: [{role, content}, ...] }
  // We convert into a single userPrompt for the cloud API and return the responseMessage.
  async chat(body: ChatRequest | { messages?: Array<{ role?: string; content?: string }> }) {
    const userId = LocalUserIdentity.getUserInfo()?.id || 'local';

    const b = body as ChatRequest & { messages?: Array<{ role?: string; content?: string }> };
  let userPrompt = b.userPrompt ?? (b as unknown as { input?: string }).input;
    if (!userPrompt && Array.isArray(b.messages)) userPrompt = messagesToPrompt(b.messages);

    const res = await CloudAiClient.chat({
      userId,
      templateId: b.templateId,
      conversationId: b.conversationId,
      userPrompt: userPrompt || '',
      provider: typeof b.provider === 'string' ? b.provider : undefined,
      model: b.model,
      context: b.context
    });

    // Return the assistant response (legacy callers expect a string or object they can parse)
    return res.responseMessage;
  },

  // Legacy chatStream returned an async-iterable (for-await-of). We emulate that by
  // wiring CloudAiClient.chatStream's callbacks into an async generator queue.
  async chatStream(params: ChatStreamParams | { messages?: Array<{ role?: string; content?: string }> }) {
    const userId = LocalUserIdentity.getUserInfo()?.id || 'local';

    const p = params as ChatStreamParams & { messages?: Array<{ role?: string; content?: string }> };
    let userPrompt = p.userPrompt;
    if (!userPrompt && Array.isArray(p.messages)) userPrompt = messagesToPrompt(p.messages);

    async function* gen() {
      const queue: unknown[] = [];
      let resolveWait: ((v?: unknown) => void) | null = null;
      let done = false;
      let error: unknown = null;

      function push(item: unknown) {
        queue.push(item);
        if (resolveWait) {
          resolveWait();
          resolveWait = null;
        }
      }

      // Start cloud streaming; CloudAiClient will invoke onChunk/onStream as data arrives.
      CloudAiClient.chatStream({
        userId,
        templateId: p.templateId,
        conversationId: p.conversationId,
        userPrompt: userPrompt || '',
        provider: typeof p.provider === 'string' ? p.provider : undefined,
        model: p.model,
        context: p.context,
        signal: p.signal,
        onChunk(chunk: ChatStreamChunk | string) {
          // prefer chunk.content when available
          if (typeof chunk === 'string') push(chunk);
          else if (chunk.type === 'chunk') push((chunk as { type: 'chunk'; content: string }).content);
          else if (chunk.type === 'conversation') push((chunk as { type: 'conversation'; data: Conversation }).data);
          p.onChunk?.(chunk as ChatStreamChunk);
        },
        onStream(fullText) {
          // push the incremental fullText
          push(fullText);
          p.onStream?.(fullText);
        }
      })
        .then(() => {
          done = true;
          if (resolveWait) {
            resolveWait();
            resolveWait = null;
          }
        })
        .catch((e) => {
          error = e;
          done = true;
          if (resolveWait) {
            resolveWait();
            resolveWait = null;
          }
        });

      while (!done || queue.length) {
        if (queue.length === 0) {
          await new Promise<void>((res) => (resolveWait = res));
        }
        while (queue.length) {
          const v = queue.shift();
          if (error) throw error;
          yield v as unknown;
        }
      }
    }

    return gen();
  },

  // Image generation
  async makeImageGenerationRequest(prompt: string, model?: string) {
    return CloudAiClient.generateImage({ prompt, model });
  }
};

// Simple key verifiers used by settings UI. Keep lightweight for now.
// Note: API key verification is handled on the server. Do not perform client-side key
// verification here. Callers should not import or use verification helpers from the client.

export default Ai;
