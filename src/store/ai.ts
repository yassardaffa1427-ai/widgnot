import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export type AIProvider = 'gemini' | 'openai' | 'qwen' | 'anthropic' | 'mistral' | 'unknown';

export interface AIState {
  apiKey: string;
  provider: AIProvider;
  modelLabel: string;
  messages: AIMessage[];
  isGenerating: boolean;
  statusText: string | null;
  error: string | null;
  isWide: boolean;

  setApiKey: (key: string) => void;
  setWide: (v: boolean) => void;
  clearMessages: () => void;
  sendMessage: (prompt: string) => Promise<void>;
}

/** Deteksi provider dari API key */
function detectProvider(key: string): AIProvider {
  const k = key.trim();
  if (k.startsWith('AIzaSy') || k.startsWith('AQ.')) return 'gemini';
  if (k.startsWith('sk-') && k.includes('ant')) return 'anthropic';
  if (k.startsWith('sk-')) return 'openai';
  if (k.startsWith('sk-or-v1-')) return 'openai'; // openrouter
  if (k.toLowerCase().includes('qwen') || k.startsWith('sk-') && k.length > 60) return 'qwen';
  return 'unknown';
}

function getModelLabel(provider: AIProvider): string {
  switch (provider) {
    case 'gemini': return 'gemini-3.5-flash-lite';
    case 'openai': return 'gpt-4o-mini';
    case 'anthropic': return 'claude-3-haiku';
    case 'qwen': return 'qwen-turbo';
    case 'mistral': return 'mistral-small';
    default: return 'AI Model';
  }
}

interface EndpointConfig {
  url: string;
  headers: Record<string, string>;
  type: 'gemini' | 'openai' | 'anthropic';
}

function getEndpoint(provider: AIProvider, apiKey: string, model: string): EndpointConfig | null {
  switch (provider) {
    case 'gemini':
      return {
        url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
        headers: { 'Content-Type': 'application/json' },
        type: 'gemini',
      };
    case 'openai':
    case 'qwen':
      return {
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        type: 'openai',
      };
    case 'anthropic':
      return {
        url: 'https://api.anthropic.com/v1/messages',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        type: 'anthropic',
      };
    default:
      return null;
  }
}

const WELCOME: AIMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Halo! Saya asisten AI di Widgnot. Tanyakan apa saja kepada saya.',
  timestamp: Date.now(),
};

export const useAI = create<AIState>()(
  persist(
    (set, get) => ({
      apiKey: '',
      provider: 'unknown',
      modelLabel: 'AI Chat assistant',
      messages: [WELCOME],
      isGenerating: false,
      statusText: null,
      error: null,
      isWide: false,

      setApiKey: (key: string) => {
        const provider = detectProvider(key);
        const modelLabel = getModelLabel(provider);
        set({ apiKey: key.trim(), provider, modelLabel, error: null });
      },

      setWide: (isWide) => set({ isWide }),

      clearMessages: () =>
        set({
          messages: [
            {
              id: `welcome-${Date.now()}`,
              role: 'assistant',
              content: 'Riwayat obrolan dibersihkan. Ada yang bisa saya bantu sekarang?',
              timestamp: Date.now(),
            },
          ],
          error: null,
        }),

      sendMessage: async (userPrompt: string) => {
        const text = userPrompt.trim();
        if (!text) return;

        const { apiKey, provider, modelLabel } = get();

        if (!apiKey) {
          set({ error: 'Masukkan API Key terlebih dahulu pada pengaturan.' });
          return;
        }

        const userMsg: AIMessage = {
          id: `u-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: Date.now(),
        };

        const aId = `a-${Date.now()}`;
        set((s) => ({
          messages: [...s.messages, userMsg, { id: aId, role: 'assistant', content: '', timestamp: Date.now(), isStreaming: true }],
          isGenerating: true,
          statusText: 'Mengetik…',
          error: null,
        }));

        try {
          const endpoint = getEndpoint(provider, apiKey, modelLabel);
          if (!endpoint) throw new Error(`Provider "${provider}" belum dikonfigurasi.`);

          const history = get().messages.slice(-8, -1).filter(m => !m.content.startsWith('⚠️'));

          let acc = '';

          if (endpoint.type === 'gemini') {
            const contents = [
              ...history.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
              { role: 'user', parts: [{ text }] },
            ];
            const res = await fetch(endpoint.url, {
              method: 'POST',
              headers: endpoint.headers,
              body: JSON.stringify({ contents, generationConfig: { temperature: 0.7, maxOutputTokens: 2048 } }),
            });
            if (!res.ok) {
              const e = await res.json().catch(() => ({}));
              throw new Error(e.error?.message || `Gagal (${res.status})`);
            }
            const reader = res.body?.getReader();
            if (!reader) throw new Error('Stream tidak tersedia.');
            const dec = new TextDecoder();
            let buf = '';
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buf += dec.decode(value, { stream: true });
              const lines = buf.split('\n');
              buf = lines.pop() || '';
              for (const line of lines) {
                const t = line.trim();
                if (!t.startsWith('data: ')) continue;
                try {
                  const j = JSON.parse(t.slice(6));
                  const chunk = j.candidates?.[0]?.content?.parts?.[0]?.text || '';
                  if (chunk) { acc += chunk; set(s => ({ messages: s.messages.map(m => m.id === aId ? { ...m, content: acc, isStreaming: true } : m) })); }
                } catch { /* partial */ }
              }
            }
          } else if (endpoint.type === 'openai') {
            const msgs = [
              { role: 'system', content: 'Kamu adalah asisten AI yang membantu dan ramah.' },
              ...history.map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: text },
            ];
            const res = await fetch(endpoint.url, {
              method: 'POST',
              headers: endpoint.headers,
              body: JSON.stringify({ model: modelLabel, messages: msgs, stream: true, max_tokens: 2048 }),
            });
            if (!res.ok) {
              const e = await res.json().catch(() => ({}));
              throw new Error(e.error?.message || `Gagal (${res.status})`);
            }
            const reader = res.body?.getReader();
            if (!reader) throw new Error('Stream tidak tersedia.');
            const dec = new TextDecoder();
            let buf = '';
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buf += dec.decode(value, { stream: true });
              const lines = buf.split('\n');
              buf = lines.pop() || '';
              for (const line of lines) {
                const t = line.trim();
                if (!t.startsWith('data: ') || t === 'data: [DONE]') continue;
                try {
                  const j = JSON.parse(t.slice(6));
                  const chunk = j.choices?.[0]?.delta?.content || '';
                  if (chunk) { acc += chunk; set(s => ({ messages: s.messages.map(m => m.id === aId ? { ...m, content: acc, isStreaming: true } : m) })); }
                } catch { /* partial */ }
              }
            }
          } else if (endpoint.type === 'anthropic') {
            const res = await fetch(endpoint.url, {
              method: 'POST',
              headers: endpoint.headers,
              body: JSON.stringify({
                model: modelLabel,
                max_tokens: 2048,
                stream: true,
                messages: [...history.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: text }],
              }),
            });
            if (!res.ok) {
              const e = await res.json().catch(() => ({}));
              throw new Error(e.error?.message || `Gagal (${res.status})`);
            }
            const reader = res.body?.getReader();
            if (!reader) throw new Error('Stream tidak tersedia.');
            const dec = new TextDecoder();
            let buf = '';
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buf += dec.decode(value, { stream: true });
              const lines = buf.split('\n');
              buf = lines.pop() || '';
              for (const line of lines) {
                const t = line.trim();
                if (!t.startsWith('data: ')) continue;
                try {
                  const j = JSON.parse(t.slice(6));
                  if (j.type === 'content_block_delta') {
                    const chunk = j.delta?.text || '';
                    if (chunk) { acc += chunk; set(s => ({ messages: s.messages.map(m => m.id === aId ? { ...m, content: acc, isStreaming: true } : m) })); }
                  }
                } catch { /* partial */ }
              }
            }
          }

          set(s => ({
            messages: s.messages.map(m => m.id === aId ? { ...m, content: acc || '(kosong)', isStreaming: false } : m),
            isGenerating: false,
            statusText: null,
          }));
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          set(s => ({
            messages: s.messages.map(m => m.id === aId ? { ...m, content: `⚠️ ${msg}`, isStreaming: false } : m),
            isGenerating: false,
            statusText: null,
            error: msg,
          }));
        }
      },
    }),
    {
      name: 'widgnot-ai-v2',
      partialize: (s) => ({ apiKey: s.apiKey, provider: s.provider, modelLabel: s.modelLabel, messages: s.messages.slice(-15) }),
    }
  )
);
