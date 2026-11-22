import { create } from 'zustand';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { generateAndDownloadMeetingDocx } from '@/lib/docxExport';
import { useAI, type AIProvider } from '@/store/ai';

interface AudioChunkPayload {
  wav_base64: string;
  duration_sec: number;
  rms: number;
  is_final: boolean;
}

interface AudioStartResult {
  system_audio: boolean;
  mic_audio: boolean;
}

interface AudioLevelPayload {
  level: number;
}

export interface MeetingState {
  isRecording: boolean;
  durationSeconds: number;
  realtimeNotes: string[];
  interimText: string;
  isMeetingEnded: boolean;
  meetingSummary: string | null;
  isSummarizing: boolean;
  audioLevel: number;
  audioSourceLabel: string;
  error: string | null;

  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  summarizeMeeting: (apiKey?: string, modelLabel?: string) => Promise<void>;
  exportDocx: () => Promise<void>;
  resetMeeting: () => void;
  formatDuration: (sec?: number) => string;
}

let timerInterval: ReturnType<typeof setInterval> | null = null;
let unlistenChunk: UnlistenFn | null = null;
let unlistenLevel: UnlistenFn | null = null;
let webMediaRecorder: MediaRecorder | null = null;
let webMediaStream: MediaStream | null = null;
let webChunkInterval: ReturnType<typeof setInterval> | null = null;
let pendingTranscriptions = 0;

function formatTimestamp(sec: number): string {
  const mins = Math.floor(sec / 60);
  const secs = sec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = typeof reader.result === 'string' ? reader.result : '';
      const idx = res.indexOf(',');
      resolve(idx >= 0 ? res.slice(idx + 1) : res);
    };
    reader.onerror = () => reject(new Error('Gagal membaca data audio.'));
    reader.readAsDataURL(blob);
  });
}

function getGeminiModelCandidates(preferred?: string): string[] {
  const list: string[] = [];
  if (preferred && preferred.toLowerCase().includes('gemini')) {
    list.push(preferred.trim());
  }
  for (const fallback of ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash']) {
    if (!list.includes(fallback)) list.push(fallback);
  }
  return list;
}

/**
 * Transkripsikan potongan audio rapat menggunakan Gemini (native audio input) atau OpenAI Whisper.
 */
async function transcribeAudioChunk(
  audioBase64: string,
  mimeType: string,
  apiKey: string,
  provider: AIProvider,
  modelLabel: string
): Promise<{ text: string | null; error?: string }> {
  if (!apiKey.trim()) {
    return { text: null, error: 'API Key belum diisi. Klik ikon kunci (🔑) untuk memasukkan Gemini/OpenAI API Key.' };
  }

  if (provider === 'gemini') {
    const prompt =
      'Kamu adalah notulen rapat profesional. Dengarkan audio rapat ini (bisa dari Google Meet, Zoom, atau mikrofon) lalu transkripsikan ucapan yang benar-benar terdengar dalam bahasa aslinya (Indonesia/Inggris). Tulis langsung dalam 1-3 poin kalimat singkat yang akurat tanpa kata pengantar. Jika hanya sunyi, noise latar, atau tidak ada ucapan manusia yang jelas, balas persis dengan: [SILENCE]';

    const candidates = getGeminiModelCandidates(modelLabel);
    let lastErr = '';

    for (const model of candidates) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { inlineData: { mimeType, data: audioBase64 } },
                    { text: prompt },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 512,
              },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleaned = raw.trim();
          if (!cleaned || cleaned.includes('[SILENCE]')) {
            return { text: null };
          }
          return { text: cleaned };
        }

        const errBody = await res.json().catch(() => ({}));
        lastErr = errBody?.error?.message || `HTTP ${res.status}`;
        // If 404/400 (model unsupported), try next Gemini model
        if (res.status === 404 || res.status === 400) {
          continue;
        }
        return { text: null, error: `Transkripsi Gemini gagal: ${lastErr}` };
      } catch (e) {
        lastErr = e instanceof Error ? e.message : String(e);
      }
    }

    return { text: null, error: `Transkripsi gagal: ${lastErr}` };
  }

  if (provider === 'openai') {
    try {
      const bytes = base64ToUint8Array(audioBase64);
      const ext = mimeType.includes('webm') ? 'webm' : 'wav';
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: mimeType });
      const form = new FormData();
      form.append('file', blob, `meeting_chunk.${ext}`);
      form.append('model', 'whisper-1');

      const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: form,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg = errBody?.error?.message || `HTTP ${res.status}`;
        return { text: null, error: `Whisper gagal: ${msg}` };
      }

      const data = await res.json();
      const text = typeof data.text === 'string' ? data.text.trim() : '';
      return { text: text || null };
    } catch (e) {
      return { text: null, error: `Whisper gagal: ${e instanceof Error ? e.message : String(e)}` };
    }
  }

  return {
    text: null,
    error: `Provider "${provider}" belum mendukung transkripsi audio langsung. Gunakan Gemini atau OpenAI API Key.`,
  };
}

function cleanupListeners() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  if (unlistenChunk) {
    unlistenChunk();
    unlistenChunk = null;
  }
  if (unlistenLevel) {
    unlistenLevel();
    unlistenLevel = null;
  }
  if (webChunkInterval) {
    clearInterval(webChunkInterval);
    webChunkInterval = null;
  }
  if (webMediaRecorder) {
    try {
      if (webMediaRecorder.state !== 'inactive') {
        webMediaRecorder.stop();
      }
    } catch {
      // ignore
    }
    webMediaRecorder = null;
  }
  if (webMediaStream) {
    webMediaStream.getTracks().forEach((t) => t.stop());
    webMediaStream = null;
  }
}

export const useMeeting = create<MeetingState>((set, get) => ({
  isRecording: false,
  durationSeconds: 0,
  realtimeNotes: [],
  interimText: '',
  isMeetingEnded: false,
  meetingSummary: null,
  isSummarizing: false,
  audioLevel: 0,
  audioSourceLabel: '',
  error: null,

  formatDuration: (sec?: number) => {
    const s = sec !== undefined ? sec : get().durationSeconds;
    return formatTimestamp(s);
  },

  startRecording: async () => {
    cleanupListeners();
    pendingTranscriptions = 0;

    const { apiKey, modelLabel } = useAI.getState();
    const hasKey = Boolean(apiKey && apiKey.trim());

    set({
      isRecording: true,
      durationSeconds: 0,
      realtimeNotes: [],
      interimText: hasKey
        ? 'Menghubungkan ke audio sistem (Google Meet) & mikrofon...'
        : 'API Key AI belum diisi — klik ikon kunci (🔑) agar suara rapat bisa ditranskrip.',
      isMeetingEnded: false,
      meetingSummary: null,
      isSummarizing: false,
      audioLevel: 0,
      audioSourceLabel: '',
      error: hasKey
        ? null
        : 'Masukkan API Key Gemini atau OpenAI (ikon kunci 🔑) agar audio rapat dapat ditranskripsi oleh AI.',
    });

    const handleAudioChunk = async (base64: string, mimeType: string) => {
      if (!base64) return;
      const aiState = useAI.getState();
      if (!aiState.apiKey.trim()) return;

      pendingTranscriptions += 1;
      const ts = formatTimestamp(get().durationSeconds);
      if (get().isRecording) {
        set({ interimText: 'AI sedang mentranskripsi percakapan...' });
      }

      try {
        const result = await transcribeAudioChunk(
          base64,
          mimeType,
          aiState.apiKey,
          aiState.provider,
          aiState.modelLabel || modelLabel
        );

        if (result.error) {
          set({ error: result.error });
        } else if (result.text) {
          const lines = result.text
            .split('\n')
            .map((l) => l.replace(/^[-•*]\s*/, '').trim())
            .filter(Boolean);

          if (lines.length > 0) {
            const stamped = lines.map((line, i) => (i === 0 ? `[${ts}] ${line}` : line));
            set((s) => ({
              realtimeNotes: [...s.realtimeNotes, ...stamped],
              error: null,
            }));
          }
        }
      } finally {
        pendingTranscriptions = Math.max(0, pendingTranscriptions - 1);
        if (pendingTranscriptions === 0 && get().isRecording) {
          set({ interimText: 'Mendengarkan audio rapat secara realtime...' });
        }
      }
    };

    // Start duration timer
    timerInterval = setInterval(() => {
      set((s) => ({ durationSeconds: s.durationSeconds + 1 }));
    }, 1000);

    // 1. Native Tauri Windows WASAPI Dual Capture (System Audio Loopback + Mic)
    if (isTauri()) {
      try {
        unlistenLevel = await listen<AudioLevelPayload>('meeting-audio-level', (event) => {
          set({ audioLevel: event.payload.level });
        });

        unlistenChunk = await listen<AudioChunkPayload>('meeting-audio-chunk', (event) => {
          const { wav_base64 } = event.payload;
          if (wav_base64) {
            void handleAudioChunk(wav_base64, 'audio/wav');
          }
        });

        const res = await invoke<AudioStartResult>('start_meeting_audio');
        const sources: string[] = [];
        if (res.system_audio) sources.push('Audio Sistem (GMeet/Speaker)');
        if (res.mic_audio) sources.push('Mikrofon');
        const label = sources.join(' + ');

        set({
          audioSourceLabel: label,
          realtimeNotes: [`Merekam: ${label}`],
          interimText: hasKey
            ? 'Mendengarkan audio rapat secara realtime...'
            : 'Audio direkam, tetapi butuh API Key untuk transkripsi AI.',
        });
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        cleanupListeners();
        set({
          isRecording: false,
          interimText: '',
          error: `Gagal memulai rekaman audio Windows: ${msg}`,
        });
        return;
      }
    }

    // 2. Browser fallback (dev mode di Chrome/Edge)
    try {
      let stream: MediaStream | null = null;
      if (navigator.mediaDevices?.getDisplayMedia) {
        try {
          stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
          // Matikan track video karena kita hanya butuh audio tab/sistem
          stream.getVideoTracks().forEach((t) => t.stop());
        } catch {
          stream = null;
        }
      }
      if (!stream || stream.getAudioTracks().length === 0) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      webMediaStream = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const startChunkRecorder = () => {
        if (!webMediaStream || !get().isRecording) return;
        const chunks: BlobPart[] = [];
        const rec = new MediaRecorder(webMediaStream, { mimeType });
        rec.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };
        rec.onstop = async () => {
          if (chunks.length > 0) {
            const blob = new Blob(chunks, { type: mimeType });
            if (blob.size > 2000) {
              const b64 = await blobToBase64(blob);
              void handleAudioChunk(b64, 'audio/webm');
            }
          }
        };
        rec.start();
        webMediaRecorder = rec;
      };

      startChunkRecorder();
      webChunkInterval = setInterval(() => {
        if (webMediaRecorder && webMediaRecorder.state === 'recording') {
          webMediaRecorder.stop();
        }
        if (get().isRecording) {
          startChunkRecorder();
        }
      }, 12000);

      set({
        audioSourceLabel: 'Audio Browser / Mikrofon',
        realtimeNotes: ['Merekam: Audio Browser / Mikrofon'],
        interimText: hasKey
          ? 'Mendengarkan audio rapat secara realtime...'
          : 'Masukkan API Key AI agar audio bisa ditranskripsi.',
      });
    } catch (err) {
      cleanupListeners();
      set({
        isRecording: false,
        interimText: '',
        error: `Izin audio ditolak: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  },

  stopRecording: async () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    set({
      isRecording: false,
      audioLevel: 0,
      interimText: 'Menyelesaikan transkripsi potongan audio terakhir...',
    });

    if (isTauri()) {
      try {
        await invoke('stop_meeting_audio');
      } catch {
        // ignore
      }
    } else if (webMediaRecorder && webMediaRecorder.state === 'recording') {
      try {
        webMediaRecorder.stop();
      } catch {
        // ignore
      }
    }

    // Tunggu sebentar agar potongan audio terakhir selesai ditranskrip oleh AI (maks 8 detik)
    const startWait = Date.now();
    await new Promise((r) => setTimeout(r, 400));
    while (pendingTranscriptions > 0 && Date.now() - startWait < 8000) {
      await new Promise((r) => setTimeout(r, 250));
    }

    cleanupListeners();

    set((s) => ({
      isRecording: false,
      interimText: '',
      isMeetingEnded: true,
      realtimeNotes:
        s.realtimeNotes.length <= 1
          ? [
              ...s.realtimeNotes,
              'Tidak ada percakapan suara yang terdeteksi selama rekaman (pastikan volume audio/GMeet aktif dan API Key valid).',
            ]
          : [...s.realtimeNotes, 'Sesi rekaman meeting selesai.'],
    }));
  },

  summarizeMeeting: async (apiKey?: string, modelLabel?: string) => {
    const { realtimeNotes } = get();
    const aiState = useAI.getState();
    const key = (apiKey || aiState.apiKey || '').trim();
    const provider = aiState.provider;
    const model = modelLabel || aiState.modelLabel;

    set({ isSummarizing: true, error: null });

    const actualTranscript = realtimeNotes
      .filter(
        (n) =>
          !n.startsWith('Merekam:') &&
          !n.includes('Sesi rekaman meeting selesai') &&
          !n.includes('Tidak ada percakapan suara yang terdeteksi')
      )
      .join('\n');

    if (!actualTranscript.trim()) {
      set({
        meetingSummary:
          'Belum ada transkrip pembicaraan yang terekam untuk diringkas. Pastikan audio Google Meet / mikrofon terdengar dan API Key aktif.',
        isSummarizing: false,
      });
      return;
    }

    const prompt = `Berikut adalah transkrip realtime dari rapat:\n\n${actualTranscript}\n\nTolong buatkan ringkasan eksekutif poin-poin penting dalam bahasa Indonesia yang rapi dengan format:\n1. Poin Utama Pembahasan\n2. Keputusan Penting\n3. Action Items (Tindak Lanjut)`;

    if (key) {
      if (provider === 'gemini') {
        for (const candidate of getGeminiModelCandidates(model)) {
          try {
            const res = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${candidate}:generateContent?key=${key}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                }),
              }
            );
            if (res.ok) {
              const data = await res.json();
              const generatedSummary = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (generatedSummary) {
                set({ meetingSummary: generatedSummary.trim(), isSummarizing: false });
                return;
              }
            }
            if (res.status === 404 || res.status === 400) continue;
          } catch {
            // try next candidate
          }
        }
      } else if (provider === 'openai' || provider === 'qwen') {
        try {
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
              model: model || 'gpt-4o-mini',
              messages: [{ role: 'user', content: prompt }],
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const generatedSummary = data.choices?.[0]?.message?.content;
            if (generatedSummary) {
              set({ meetingSummary: generatedSummary.trim(), isSummarizing: false });
              return;
            }
          }
        } catch {
          // fallback below
        }
      }
    }

    // Fallback ringkasan langsung dari transkrip asli (tanpa teks palsu)
    const bulletItems = actualTranscript
      .split('\n')
      .map((n) => `• ${n}`)
      .join('\n');

    set({
      meetingSummary: `📌 Ringkasan Transkrip Rapat:\n\n${bulletItems}`,
      isSummarizing: false,
    });
  },

  exportDocx: async () => {
    const { realtimeNotes, meetingSummary, formatDuration } = get();
    await generateAndDownloadMeetingDocx({
      title: 'Notulen Rapat (Meeting Minutes)',
      durationFormatted: formatDuration(),
      realtimeNotes,
      summary: meetingSummary,
    });
  },

  resetMeeting: () => {
    if (isTauri() && get().isRecording) {
      void invoke('stop_meeting_audio').catch(() => {});
    }
    cleanupListeners();
    pendingTranscriptions = 0;
    set({
      isRecording: false,
      durationSeconds: 0,
      realtimeNotes: [],
      interimText: '',
      isMeetingEnded: false,
      meetingSummary: null,
      isSummarizing: false,
      audioLevel: 0,
      audioSourceLabel: '',
      error: null,
    });
  },
}));
