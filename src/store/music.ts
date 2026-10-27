import { create } from 'zustand';

export interface Track {
  id: string;
  name: string;
  artist: string;
  url?: string;
  duration: number;
  coverGradient?: string;
  thumbnail?: string;
  source?: 'spotify' | 'youtube' | 'local';
}

export type BtStatus = 'idle' | 'pairing' | 'connected';
export type MediaSource = 'none' | 'spotify' | 'youtube' | 'local';

interface MusicState {
  hasActiveMedia: boolean;
  source: MediaSource;
  tracks: Track[];
  index: number;
  playing: boolean;
  current: number;
  duration: number;
  bt: BtStatus;
  btName: string;
  deviceType: 'speaker' | 'airpods';
  isOSMedia?: boolean;
  addFiles: (files: FileList | File[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (ratio: number) => void;
  pairBluetooth: () => Promise<void>;
  toggleDevice: () => void;
  connectSource: (src: 'spotify' | 'youtube') => void;
  disconnectMedia: () => void;
  handleOSMedia: (payload: OSMediaData) => void;
}

const DEFAULT_TRACKS: Track[] = [];

// Simple ambient audio synth generator using Web Audio API
class SynthPlayer {
  private ctx: AudioContext | null = null;
  private timerId: number | null = null;
  private isPlaying = false;
  private chordIndex = 0;
  private chords = [
    [261.63, 329.63, 392.00, 493.88], // Cmaj7
    [220.00, 261.63, 329.63, 392.00], // Am7
    [174.61, 220.00, 261.63, 329.63], // Fmaj7
    [196.00, 246.94, 293.66, 349.23], // G7
  ];

  private getCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    const ctx = this.getCtx();

    const playChord = () => {
      if (!this.isPlaying) return;
      const notes = this.chords[this.chordIndex % this.chords.length];
      this.chordIndex++;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.04 / (idx + 1), ctx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.8);

        osc.connect(filter).connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 3.0);
      });
    };

    playChord();
    this.timerId = window.setInterval(playChord, 3000);
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}

const synth = new SynthPlayer();
const audio = typeof Audio !== 'undefined' ? new Audio() : (null as unknown as HTMLAudioElement);

const artworkCache = new Map<string, string>();
const pendingArtworkFetches = new Set<string>();

export function parseTrackMeta(rawTitle: string, rawArtist?: string): { title: string; artist: string } {
  let t = (rawTitle || '')
    .replace(/^\(\d+\)\s*/, '')
    .replace(/^[▶►]\s*/, '')
    .trim();

  // Bersihkan embel-embel umum video/audio YouTube (Official Video, Lyric Video, dll)
  t = t.replace(/\s*[\(\[](?:Official\s*(?:Music\s*|Lyric\s*)?Video|Official\s*Audio|Lyric\s*Video|Full\s*Lyrics?|Audio|Visualizer|Music\s*Video|MV|HD|4K|Remastered|Live\s*Session|Audio\s*Video).*?[\)\]]/gi, '').trim();
  t = t.replace(/\s*(?:\|\||\/\/).*$/, '').trim();

  let artist = (rawArtist || '').trim();
  let title = t;

  // Bila format judul adalah "Artist - Song Title" atau "Artist – Song Title"
  const dashMatch = t.match(/^(.*?)\s*[-–—]\s*(.*?)$/);
  if (dashMatch) {
    artist = dashMatch[1].trim();
    title = dashMatch[2].trim();
  }

  // Bersihkan label channel seperti Official, VEVO, - Topic
  artist = artist
    .replace(/\s*-\s*Topic$/i, '')
    .replace(/\s+Official$/i, '')
    .replace(/VEVO$/i, '')
    .trim();

  if (!artist || artist.toLowerCase() === 'youtube') {
    artist = rawArtist && rawArtist !== 'YouTube' ? rawArtist : 'YouTube';
  }

  return { title: title || rawTitle, artist: artist || 'Unknown Artist' };
}

async function fetchArtwork(title: string, artist?: string): Promise<string | null> {
  const { title: cleanTitle, artist: cleanArtist } = parseTrackMeta(title, artist);
  const query = cleanArtist && cleanArtist !== 'YouTube' && cleanArtist !== 'Spotify'
    ? `${cleanArtist} ${cleanTitle}`
    : cleanTitle;
  const cacheKey = query.toLowerCase().trim();
  if (artworkCache.has(cacheKey)) return artworkCache.get(cacheKey)!;
  if (pendingArtworkFetches.has(cacheKey)) return null;

  pendingArtworkFetches.add(cacheKey);
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0 && data.results[0].artworkUrl100) {
        const artUrl = data.results[0].artworkUrl100.replace('100x100bb', '300x300bb');
        artworkCache.set(cacheKey, artUrl);
        return artUrl;
      }
    }
  } catch {
    // network or api error
  } finally {
    pendingArtworkFetches.delete(cacheKey);
  }
  return null;
}

export const useMusic = create<MusicState>((set, get) => {
  let tickInterval: number | null = null;

  const startTicker = () => {
    if (tickInterval) clearInterval(tickInterval);
    tickInterval = window.setInterval(() => {
      const s = get();
      if (!s.playing) return;
      const t = s.tracks[s.index];
      if (!t) return;
      const max = t.duration || 180;
      const next = s.current + 1;
      if (next >= max) {
        get().next();
      } else {
        set({ current: next });
      }
    }, 1000);
  };

  const stopTicker = () => {
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
  };

  const load = (i: number, autoplay: boolean) => {
    const t = get().tracks[i];
    if (!t) return;
    if (t.url && audio) {
      audio.src = t.url;
      if (autoplay) void audio.play().catch(() => set({ playing: false }));
    } else {
      if (audio) audio.pause();
      if (autoplay) synth.play();
    }
    set({ index: i, current: 0, duration: t.duration || 180, playing: autoplay });
    if (autoplay) startTicker();
  };

  if (audio) {
    audio.addEventListener('timeupdate', () => set({ current: audio.currentTime }));
    audio.addEventListener('loadedmetadata', () => set({ duration: audio.duration || 0 }));
    audio.addEventListener('play', () => {
      set({ playing: true });
      startTicker();
    });
    audio.addEventListener('pause', () => {
      set({ playing: false });
      stopTicker();
    });
    audio.addEventListener('ended', () => {
      const { index, tracks } = get();
      if (index < tracks.length - 1) load(index + 1, true);
      else {
        set({ playing: false });
        stopTicker();
      }
    });
  }

  return {
    hasActiveMedia: false,
    source: 'none',
    tracks: DEFAULT_TRACKS,
    index: 0,
    playing: false,
    current: 0,
    duration: 0,
    bt: 'connected',
    btName: 'AirPods Pro',
    deviceType: 'airpods',

    connectSource: (src: 'spotify' | 'youtube') => {
      if (window.electronAPI?.toggleOSMedia) {
        window.electronAPI.toggleOSMedia();
      }
      set({ hasActiveMedia: true, source: src, playing: true });
    },

    disconnectMedia: () => {
      synth.stop();
      if (audio) audio.pause();
      stopTicker();
      set({ hasActiveMedia: false, source: 'none', playing: false, current: 0, duration: 0 });
    },

    addFiles: (files) => {
      const added: Track[] = Array.from(files)
        .filter((f) => f.type.startsWith('audio/'))
        .map((f) => ({
          id: `${f.name}-${f.size}`,
          name: f.name.replace(/\.[^.]+$/, ''),
          artist: 'Local file',
          url: URL.createObjectURL(f),
          duration: 180,
          source: 'local' as const,
        }));
      if (!added.length) return;
      set((s) => ({ tracks: [...added, ...s.tracks], hasActiveMedia: true, source: 'local' }));
      load(0, true);
    },

    toggle: () => {
      const s = get();
      if (window.electronAPI?.toggleOSMedia) {
        window.electronAPI.toggleOSMedia();
        set({ playing: !s.playing });
        return;
      }

      if (!s.hasActiveMedia) return;

      const t = s.tracks[s.index];
      if (!t) return;

      if (s.playing) {
        if (t.url && audio) audio.pause();
        else synth.stop();
        set({ playing: false });
        stopTicker();
      } else {
        if (t.url && audio) void audio.play().catch(() => set({ playing: false }));
        else synth.play();
        set({ playing: true });
        startTicker();
      }
    },

    next: () => {
      if (window.electronAPI?.nextOSMedia) {
        window.electronAPI.nextOSMedia();
        return;
      }

      if (!get().hasActiveMedia) return;
      const { index, tracks, playing } = get();
      const nextIdx = (index + 1) % tracks.length;
      load(nextIdx, playing);
    },

    prev: () => {
      if (window.electronAPI?.prevOSMedia) {
        window.electronAPI.prevOSMedia();
        return;
      }

      if (!get().hasActiveMedia) return;
      const { index, tracks, playing, current } = get();
      if (current > 3 || index === 0) {
        set({ current: 0 });
        if (audio && tracks[index]?.url) audio.currentTime = 0;
      } else {
        const prevIdx = (index - 1 + tracks.length) % tracks.length;
        load(prevIdx, playing);
      }
    },

    seek: (r) => {
      const s = get();
      if (!s.hasActiveMedia) return;
      const dur = s.duration || 180;
      const pos = Math.max(0, Math.min(dur, r * dur));
      set({ current: pos });
      if (audio && s.tracks[s.index]?.url) {
        audio.currentTime = pos;
      }
    },

    pairBluetooth: async () => {
      set({ bt: 'pairing' });
      try {
        const nav = navigator as Navigator & { bluetooth?: { requestDevice: (o: object) => Promise<{ name?: string }> } };
        if (!nav.bluetooth) throw new Error('unsupported');
        const dev = await nav.bluetooth.requestDevice({ acceptAllDevices: true });
        set({ bt: 'connected', btName: dev.name ?? 'AirPods Pro' });
      } catch {
        set({ bt: 'connected', btName: 'AirPods Pro' });
      }
    },

    toggleDevice: () => {
      const s = get();
      if (s.deviceType === 'airpods') {
        set({ deviceType: 'speaker', btName: 'MacBook Speaker' });
      } else {
        set({ deviceType: 'airpods', btName: 'AirPods Pro' });
      }
    },

    handleOSMedia: (payload: OSMediaData) => {
      if (payload.hasMedia && payload.title) {
        const isSpotify = (payload.appId || payload.source || '').toLowerCase().includes('spotify') ||
                          (payload.artist || '').toLowerCase().includes('spotify');
        const trackSource = isSpotify ? 'spotify' : 'youtube';

        const { title: cleanTitle, artist: cleanArtist } = parseTrackMeta(payload.title, payload.artist);

        const currentTrack = get().tracks[get().index];
        const isSameTrack = currentTrack && (currentTrack.name === cleanTitle || currentTrack.name === payload.title);

        const query = cleanArtist && cleanArtist !== 'YouTube' && cleanArtist !== 'Spotify'
          ? `${cleanArtist} ${cleanTitle}`
          : cleanTitle;
        const cacheKey = query.toLowerCase().trim();

        let thumb = payload.thumbnail || (isSameTrack ? currentTrack?.thumbnail : undefined);
        if (!thumb && artworkCache.has(cacheKey)) {
          thumb = artworkCache.get(cacheKey);
        } else if (payload.thumbnail) {
          artworkCache.set(cacheKey, payload.thumbnail);
        }

        const osTrack: Track = {
          id: `os-${cleanTitle}`,
          name: cleanTitle,
          artist: cleanArtist || (isSpotify ? 'Spotify' : 'YouTube'),
          duration: payload.duration || 180,
          source: trackSource,
          thumbnail: thumb,
          coverGradient: isSpotify
            ? 'linear-gradient(135deg, #1DB954 0%, #121212 90%)'
            : 'linear-gradient(135deg, #ff2a85 0%, #7b1fa2 50%, #1e1035 100%)',
        };

        set({
          hasActiveMedia: true,
          isOSMedia: true,
          source: trackSource,
          tracks: [osTrack],
          index: 0,
          playing: Boolean(payload.playing),
          current: payload.position !== undefined && payload.position > 0 ? payload.position : (isSameTrack ? get().current : 0),
          duration: payload.duration || 180,
        });

        // If no thumbnail yet, fetch from iTunes Search API in background
        if (!thumb) {
          void fetchArtwork(cleanTitle, cleanArtist).then((art) => {
            if (art) {
              const cur = get().tracks[get().index];
              if (cur && (cur.name === cleanTitle || cur.name === payload.title)) {
                set({
                  tracks: [{ ...cur, thumbnail: art }],
                });
              }
            }
          });
        }
      } else {
        const s = get();
        if (s.isOSMedia) {
          set({
            hasActiveMedia: false,
            isOSMedia: false,
            playing: false,
          });
        }
      }
    },
  };
});

export const coverFor = (trackOrSeed: Track | string) => {
  if (typeof trackOrSeed === 'object' && trackOrSeed.coverGradient) {
    return trackOrSeed.coverGradient;
  }
  const seed = typeof trackOrSeed === 'object' ? trackOrSeed.name : trackOrSeed;
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `linear-gradient(135deg, hsl(${h} 80% 55%), hsl(${(h + 60) % 360} 85% 35%))`;
};
