import { JSONStorage } from '@noodl/platform';

import { api } from '@noodl-constants/NeueBackend';
import { NeueSession } from '@noodl-models/NeueServices/type';

import { ToastLayer } from '../../../views/ToastLayer/ToastLayer';
import { NeueService } from '../../NeueServices/NeueService';
import type { Conversation } from '../interfaces';

const apiBase = (path: string) => api.aiUrl + `/api/v1${path}`;

// --- Auth headers helper ---
async function authHeaders(extra?: Record<string, string>) {
  const aiToken = await NeueService.instance.getValidAiToken();
  if (!aiToken) {
    try {
      ToastLayer.showError('Please sign in to the AI service.');
    } catch {}
    throw new Error('No AI token found. Please authenticate via login.');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${aiToken}`,
    ...(extra || {})
  };
}

class CloudAiClientClass {
  // --- Token exchange ---
  async exchangeTokenForAi(cognitoToken: string): Promise<string> {
    try {
      const response = await fetch(apiBase('/exchange-token'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cognitoToken}`
        }
      });

      if (!response.ok) throw new Error(`Token exchange failed: ${response.status}`);

      const data = await response.json();
      const aiJwt = data?.data?.token;
      const expiresIn = data?.data?.expiresIn;

      if (!aiJwt || !expiresIn) throw new Error('Invalid token exchange response');

      const expiresAt = Date.now() + expiresIn * 1000;

      // Store in NeueSession (persist to disk if possible).
      // Update the in-memory session object returned by NeueService if present,
      // then attempt to persist. If persistence fails (EPERM on Windows),
      // log and continue with the in-memory session so the app remains usable.
      const current = NeueService.instance.getCurrentNeueSession();
      const session = current || ({} as NeueSession);
      session.aiToken = aiJwt;
      session.aiTokenExpiresAt = expiresAt;
      // If there is an in-memory session object, ensure it reflects the new values.
      if (current) {
        Object.assign(current, { aiToken: aiJwt, aiTokenExpiresAt: expiresAt });
      }
      try {
        JSONStorage.set('neueSession', session);
      } catch (err) {
        try {
          console.warn('Failed to persist AI token to storage (non-fatal):', err);
          ToastLayer.showError(
            'Warning: could not persist AI session to disk. Continue working but sign-in may not be remembered.'
          );
        } catch {}
      }

      return aiJwt;
    } catch (err) {
      console.error('Failed to exchange token for AI service:', err);
      throw err;
    }
  }

  // --- Conversations ---
  async getConversation(conversationId: string): Promise<Conversation> {
    return this.request(`/conversations/${encodeURIComponent(conversationId)}`, {
      method: 'GET',
      headers: await authHeaders()
    });
  }

  async getUsage(conversationId: string): Promise<any> {
    const q = new URLSearchParams({ conversationId });
    return this.request(`/usage?${q.toString()}`, {
      method: 'GET',
      headers: await authHeaders()
    });
  }

  // --- Generate image ---
  async generateImage(params: { userPrompt: string; model?: string }): Promise<any> {
    const body = { ...params };
    console.log('Generating image with params:', body);

    // Call API directly so we can normalize different response shapes.
    const r = await fetch(apiBase('/images/generate'), {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(await r.text());
    const j = await r.json();
    // j may be: { status: 'success', data: { b64_json: '...' } }
    // or { data: { b64_json: '...' } } or { b64_json: '...' }
    // Normalize to return the inner data object (containing b64_json) when possible.
    try {
      if (j?.data?.b64_json) return j.data;
      if (j?.data && j.data.data && j.data.data.b64_json) return j.data.data;
      if (j?.b64_json) return j;
      // If the request wrapper already returned the inner data shape, fall back to that
      if (j?.data) return j.data;
    } catch (err) {
      console.warn('Unexpected image response shape, returning raw JSON', j);
    }
    return j;
  }

  // --- Non-streaming chat ---
  async chat(params: {
    templateId: string;
    userPrompt: string;
    conversationId?: string;
    provider?: string;
    model?: string;
    context?: any;
  }): Promise<{ conversation: Conversation; responseMessage: any }> {
    const body = { ...params };
    return this.request('/chat', {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(body)
    });
  }

  // --- Streaming chat ---
  async chatStream(params: {
    templateId: string;
    userPrompt: string;
    conversationId?: string;
    context?: any;
    onChunk?: (chunk: any) => void;
    signal?: AbortSignal;
  }): Promise<{ conversation?: Conversation }> {
    const body = { ...params, stream: true };
    const r = await fetch(apiBase('/chat'), {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(body),
      signal: params.signal
    });
    if (!r.ok || !r.body) {
      throw new Error(await r.text());
    }

    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let conversation: Conversation | undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex;
      while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);

        if (!line) continue;

        const chunk = JSON.parse(line);
        params.onChunk?.(chunk);

        if (chunk.type === 'conversation') {
          conversation = chunk.data;
        }
        if (chunk.type === 'error') {
          throw new Error(chunk.error || 'Model error occurred');
        }
      }
    }

    return { conversation };
  }

  // --- Generic fetch wrapper ---
  private async request<T>(path: string, options: RequestInit): Promise<T> {
    const r = await fetch(apiBase(path), options);
    if (!r.ok) throw new Error(await r.text());
    const j = await r.json();
    return j.data as T;
  }
}

// --- Export singleton instance ---
export const CloudAiClient = new CloudAiClientClass();

// Convenience named exports for legacy call sites that import functions directly.
// These are bound to the singleton instance so callers can do `import { chat } from './CloudAiClient'`.
export const chat = CloudAiClient.chat.bind(CloudAiClient);
export const chatStream = CloudAiClient.chatStream.bind(CloudAiClient);
export const getConversation = CloudAiClient.getConversation.bind(CloudAiClient);
export const getUsage = CloudAiClient.getUsage.bind(CloudAiClient);
export const generateImage = CloudAiClient.generateImage.bind(CloudAiClient);
export const exchangeTokenForAi = CloudAiClient.exchangeTokenForAi.bind(CloudAiClient);
