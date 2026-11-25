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
      'Dengarkan potongan audio rapat ini lalu transkripsikan ucapan yang terdengar secara akurat dalam bahasa aslinya (Indonesia/Inggris) tanpa kata pengantar. Jika hanya sunyi, noise latar, atau tidak ada ucapan manusia yang jelas, balas persis dengan: [SILENCE]';

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
        : 'Masukkan API Key Gemini atau OpenAI (ikon kunci 🔑) agar audio rapat dapat ditranskripsi & dirangkum oleh AI.',
    });

    const handleAudioChunk = async (base64: string, mimeType: string) => {
      if (!base64) return;
      const aiState = useAI.getState();
      if (!aiState.apiKey.trim()) return;

      pendingTranscriptions += 1;
      const ts = formatTimestamp(get().durationSeconds);
      if (get().isRecording) {
        set({ interimText: 'Mencatat pembicaraan rapat...' });
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
            const joined = lines.join(' ');
            set((s) => ({
              realtimeNotes: [...s.realtimeNotes, `[${ts}] ${joined}`],
              error: null,
            }));
          }
        }
      } finally {
        pendingTranscriptions = Math.max(0, pendingTranscriptions - 1);
        if (pendingTranscriptions === 0 && get().isRecording) {
          set({ interimText: 'Mendengarkan jalannya rapat (nanti otomatis dirangkum AI saat selesai)...' });
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
          interimText: hasKey
            ? 'Mendengarkan jalannya rapat (nanti otomatis dirangkum AI saat selesai)...'
            : 'Audio direkam, tetapi butuh API Key untuk transkripsi & ringkasan AI.',
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
        interimText: hasKey
          ? 'Mendengarkan jalannya rapat (nanti otomatis dirangkum AI saat selesai)...'
          : 'Masukkan API Key AI agar audio bisa ditranskripsi & dirangkum.',
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
      isMeetingEnded: true,
      isSummarizing: true,
      interimText: 'Menyelesaikan rekaman & mengolah poin-poin penting dengan AI...',
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

    // Tunggu hingga potongan audio terakhir selesai ditranskrip oleh AI (maks 10 detik)
    const startWait = Date.now();
    await new Promise((r) => setTimeout(r, 450));
    while (pendingTranscriptions > 0 && Date.now() - startWait < 10000) {
      await new Promise((r) => setTimeout(r, 250));
    }

    cleanupListeners();
    set({ interimText: '' });

    // Workflow baru: Begitu rekaman selesai, langsung ubah transkrip awal-akhir menjadi Poin-Poin Penting saja dengan kecerdasan AI
    await get().summarizeMeeting();
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
        meetingSummary: null,
        error:
          'Tidak ada percakapan suara yang terekam selama sesi meeting (pastikan suara Google Meet / mikrofon aktif dan API Key valid).',
        isSummarizing: false,
      });
      return;
    }

    const prompt = `Kamu adalah asisten notulen rapat eksekutif yang sangat cerdas dan teliti.
Berikut adalah rekaman transkrip mentah dari awal sampai akhir rapat (terdiri dari potongan waktu per beberapa detik, mungkin mengandung kata jeda "eh", cek suara/layar, basa-basi, atau kalimat yang terbelah antar-timestamp):

--- TRANSKRIP MENTAH ---
${actualTranscript}
--- AKHIR TRANSKRIP ---

Tugasmu:
Olahlah seluruh percakapan di atas menjadi **Notulen Poin-Poin Penting Rapat** yang bersih, utuh, padat, dan profesional dalam bahasa Indonesia.
Aturan penting:
- BUANG semua basa-basi, cek mikrofon/layar ("suara kedengaran?", "layar kelihatan?"), gumaman ("eh", "anu"), dan pengulangan kata.
- SATUKAN kalimat yang terpotong antar-timestamp sehingga menjadi poin pemikiran yang utuh dan akurat.
- JANGAN menghilangkan detail penting seperti nama orang/dosen/tim, angka/jumlah, alasan utama, kendala, tenggat waktu, maupun solusi yang dibahas.
- Jangan menyalin mentah timestamp [00:12] dsb. Tulis murni poin-poin intisarinya saja.

Gunakan struktur persis berikut:
## Ringkasan Konteks Rapat
(1-2 kalimat singkat yang menjelaskan topik utama dan tujuan rapat ini)

## Poin-Poin Penting Pembahasan
- **Subtopik / Inti Poin**: Penjelasan ringkas, jelas, dan akurat sesuai fakta pembicaraan.
(tambahkan poin seperlunya sesuai seluruh isi diskusi dari awal hingga akhir)

## Keputusan & Kesimpulan
- Poin keputusan atau kesimpulan yang disepakati dalam rapat.

## Tindak Lanjut (Action Items)
- Langkah konkret yang perlu dilakukan beserta pihak terkait (jika disebutkan dalam rapat).`;

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
                  generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 4096,
                  },
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
              temperature: 0.2,
              max_tokens: 4096,
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
      } else if (provider === 'anthropic') {
        try {
          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': key,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: model || 'claude-3-haiku-20240307',
              max_tokens: 4096,
              messages: [{ role: 'user', content: prompt }],
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const generatedSummary = data.content?.[0]?.text;
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

    set({
      error: 'Gagal menyusun poin penting dengan AI (periksa koneksi internet atau kuota API Key), coba klik "Ringkaskan ulang".',
      isSummarizing: false,
    });
  },

  exportDocx: async () => {
    // Pastikan sudah dirangkum menjadi poin penting oleh AI sebelum diekspor ke .docx
    if (!get().meetingSummary && get().realtimeNotes.length > 0 && !get().isSummarizing) {
      await get().summarizeMeeting();
    }

    const { realtimeNotes, meetingSummary, formatDuration } = get();
    await generateAndDownloadMeetingDocx({
      title: 'Notulen Poin Penting Rapat',
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
