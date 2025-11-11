import { Conversation } from './interfaces';

export const apiBase = (path: string) => `/api/v1${path}`;

export async function initSession(): Promise<{ sessionId: string }> {
  const r = await fetch(apiBase('/session/init'), { method: 'POST' });
  if (!r.ok) throw new Error(await r.text());
  const j = await r.json();
  return j.data;
}

export async function endSession(sessionId: string) {
  await fetch(apiBase('/session/end'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId })
  });
}

export async function fetchConversation(sessionId: string, conversationId: string) {
  const q = new URLSearchParams({ sessionId, conversationId });
  const r = await fetch(apiBase(`/conversation?${q.toString()}`));
  if (!r.ok) throw new Error(await r.text());
  const j = await r.json();
  return j.data as Conversation;
}

export async function sendChat(body: {
  sessionId: string;
  conversationId?: string;
  input: string;
  command?: any;
  stream?: boolean;
}) {
  const r = await fetch(apiBase('/chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(await r.text());
  const j = await r.json();
  return j.data;
}

// SSE streaming helper
export function streamChat(body: { sessionId: string; conversationId?: string; input: string; command?: any }) {
  const url = apiBase('/chat');
  // For SSE, server would need to accept GET with query string or POST that upgrades.
  // If server's handleChatRequest supports streaming over HTTP response, you can
  // open an EventSource to a dedicated endpoint like /chat/stream?sessionId=...&...
  // Implement whichever pattern server supports. Pseudocode:
  const params = new URLSearchParams({ sessionId: body.sessionId, input: body.input });
  if (body.conversationId) params.set('conversationId', body.conversationId);
  if (body.command) params.set('command', JSON.stringify(body.command));
  const es = new EventSource(apiBase(`/chat/stream?${params.toString()}`));
  return es; // client listens for 'message' and 'error' events
}
