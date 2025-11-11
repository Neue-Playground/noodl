import { AiUtils } from '../context/ai-utils';
import type { Conversation } from '../interfaces';

const apiBase = (path: string) => `/api/v1${path}`;

function authHeaders(extra?: Record<string, string>) {
	const token = AiUtils.AiUtils.generateAuthToken();
	return {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${token}`,
		...(extra || {})
	};
}

export type ChatStreamChunk =
	| { type: 'chunk'; content: string }
	| { type: 'done' }
	| { type: 'error'; message: string }
	| { type: 'conversation'; data: Conversation };

export async function getTemplates(): Promise<any> {
	const r = await fetch(apiBase('/config/templates'), {
		method: 'GET',
		headers: authHeaders()
	});
	if (!r.ok) throw new Error(await r.text());
	const j = await r.json();
	return j.data;
}

export async function getConversation(conversationId: string): Promise<Conversation> {
	const r = await fetch(apiBase(`/conversations/${encodeURIComponent(conversationId)}`), {
		method: 'GET',
		headers: authHeaders()
	});
	if (!r.ok) throw new Error(await r.text());
	const j = await r.json();
	return j.data as Conversation;
}

export async function getUsage(conversationId: string): Promise<any> {
	const q = new URLSearchParams({ conversationId });
	const r = await fetch(apiBase(`/usage?${q.toString()}`), {
		method: 'GET',
		headers: authHeaders()
	});
	if (!r.ok) throw new Error(await r.text());
	const j = await r.json();
	return j.data;
}

export async function generateImage(body: { prompt: string; model?: string }): Promise<any> {
	const r = await fetch(apiBase('/images/generate'), {
		method: 'POST',
		headers: authHeaders(),
		body: JSON.stringify(body)
	});
	if (!r.ok) throw new Error(await r.text());
	const j = await r.json();
	return j.data;
}

// Non-streaming chat request. Returns conversation plus the assistant response message.
export async function chat(body: {
	userId: string;
	templateId?: string;
	conversationId?: string;
	userPrompt: string;
	provider?: string;
	model?: string;
	context?: any;
}): Promise<{ conversation: Conversation; responseMessage: any }> {
	const r = await fetch(apiBase('/chat'), {
		method: 'POST',
		headers: authHeaders(),
		body: JSON.stringify(body)
	});
	if (!r.ok) throw new Error(await r.text());
	const j = await r.json();
	return j.data as { conversation: Conversation; responseMessage: any };
}

// Streaming chat using fetch + ReadableStream. The server writes JSON chunks:
// { type: 'chunk', content }, ... then { type: 'conversation', data } and ends.
export async function chatStream(params: {
	userId: string;
	templateId?: string;
	conversationId?: string;
	userPrompt: string;
	provider?: string;
	model?: string;
	context?: any;
	onStream?: (fullText: string) => void;
	onChunk?: (chunk: ChatStreamChunk) => void;
	signal?: AbortSignal;
}): Promise<{ fullText: string; conversation?: Conversation }> {
	const { onStream, onChunk } = params;
	const r = await fetch(apiBase('/chat'), {
		method: 'POST',
		headers: authHeaders(),
		body: JSON.stringify({ ...params, stream: true }),
		signal: params.signal
	});
	if (!r.ok || !r.body) throw new Error(await r.text());

	const reader = r.body.getReader();
	const decoder = new TextDecoder();
	let buffer = '';
	let full = '';
	let finalConversation: Conversation | undefined;

	// helper: try parse any complete JSON object boundaries from buffer
	function tryDrainBuffer() {
		// Prefer newline-delimited if server adds it
		let progressed = true;
		while (progressed) {
			progressed = false;
			if (buffer.indexOf('\n') !== -1) {
				const lines = buffer.split('\n');
				buffer = lines.pop() || '';
				for (const line of lines) {
					const trimmed = line.trim();
					if (!trimmed) continue;
					tryHandleJson(trimmed);
				}
				progressed = true;
				continue;
			}
			// Fallback: attempt to parse whole buffer as a JSON object
			const trimmed = buffer.trim();
			if (!trimmed) break;
			try {
				JSON.parse(trimmed);
				tryHandleJson(trimmed);
				buffer = '';
				progressed = true;
			} catch {
				// not a full JSON object yet; wait for more
			}
		}
	}

	function tryHandleJson(jsonStr: string) {
		try {
			const chunk = JSON.parse(jsonStr) as ChatStreamChunk;
			onChunk?.(chunk);
			if (chunk.type === 'chunk') {
				full += chunk.content || '';
				onStream?.(full);
			} else if (chunk.type === 'conversation') {
				finalConversation = chunk.data;
			}
		} catch {
			// ignore malformed chunk
		}
	}

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		buffer += decoder.decode(value, { stream: true });
		tryDrainBuffer();
	}
	// drain any remaining
	buffer += decoder.decode();
	tryDrainBuffer();

	return { fullText: full, conversation: finalConversation };
}


