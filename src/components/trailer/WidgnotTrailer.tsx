import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from './sound';
import { useUI, type PageId } from '@/store/ui';
import { Disc, Play, Pause, Skip, AirPods, Stopwatch, CheckCircle, Circle, CalendarDays } from '../ui/Icons';
import { contentSpring } from '@/lib/motion';
import '@/styles/trailer.css';

const Volume2 = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const VolumeX = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

interface Props {
  onClose: () => void;
}

interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  accent: string;
  pageTarget: PageId;
}

const CHAPTERS: Chapter[] = [
  {
    id: 'island',
    title: 'Liquid Dynamic Island',
    subtitle: 'Arsitektur Dua Lapisan & Animasi Spring',
    desc: 'Kapsul mengapung dengan material Liquid Glass (blur 28px, saturasi 180%), continuous squircle, dan penambatan magnetik ke tepi layar.',
    accent: '#0a84ff',
    pageTarget: 'music',
  },
  {
    id: 'music',
    title: 'Media Sync & Audio Scrubber',
    subtitle: 'Sinkronisasi Otomatis YouTube & Spotify',
    desc: 'Deteksi real-time musik Windows, equalizer visualizer bar, artwork bersinar, dan track scrubber 4px presisi dengan indikator thumb.',
    accent: '#ff2a85',
    pageTarget: 'music',
  },
  {
    id: 'bluetooth',
    title: 'AirPods & Status Baterai',
    subtitle: 'Indikator Baterai Melingkar & Dual Earbud',
    desc: 'Menampilkan persentase baterai L/R earbud secara independen dengan font tabular angka yang stabil dan cincin charging terkalibrasi.',
    accent: '#00c6ff',
    pageTarget: 'bluetooth',
  },
  {
    id: 'timer',
    title: 'Focus Timer & Mode Minimized',
    subtitle: 'Teknik Pomodoro Tanpa Gangguan',
    desc: 'Fokus 25 menit & istirahat 5 menit dengan progress ring visual. Dapat diperkecil menjadi kapsul mini di sudut layar saat Anda bekerja.',
    accent: '#ff453a',
    pageTarget: 'timer',
  },
  {
    id: 'calendar',
    title: 'Kalender & Peringatan Deadline',
    subtitle: 'Manajemen Aktivitas & Bubble Pintar',
    desc: 'Kalender bulanan dengan kartu tambah aktivitas, jadwal mulai & deadline, serta maskot ekspresif yang mengingatkan batas waktu.',
    accent: '#ff9f0a',
    pageTarget: 'calendar',
  },
  {
    id: 'todo-notes',
    title: 'Todo Checklist & Catatan Wide',
    subtitle: 'Produktivitas Cepat & Ekspor Teks',
    desc: 'Ceklis tugas dengan animasi coret halus, scratchpad dengan penghitung kata otomatis, pelebaran layout dinamis, serta ekspor file .txt.',
    accent: '#30d158',
    pageTarget: 'note',
  },
];

export function WidgnotTrailer({ onClose }: Props) {
  const { goTo, setOpen, setWide } = useUI();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: 390, y: 240 });
  const [isClicking, setIsClicking] = useState(false);
  const [simulatedPlaying, setSimulatedPlaying] = useState(true);
  const [simulatedTaskDone, setSimulatedTaskDone] = useState(false);
  const [simulatedWide, setSimulatedWide] = useState(false);
  const [simulatedTimerMode, setSimulatedTimerMode] = useState<'focus' | 'break'>('focus');
  const [simulatedScrub, setSimulatedScrub] = useState(45); // percentage

  const ch = CHAPTERS[currentIdx];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio mute toggle
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
  };

  // Switch chapter
  const selectChapter = (idx: number) => {
    setCurrentIdx(idx);
    sound.pop();
  };

  // Open the live widget in the actual app
  const tryLive = () => {
    onClose();
    goTo(ch.pageTarget);
    setOpen(true);
    if (ch.id === 'todo-notes') {
      setWide(true);
    }
    sound.chime();
  };

  // Auto-advance timeline
  useEffect(() => {
    if (!isPlaying) return;
    timerRef.current = setTimeout(() => {
      setCurrentIdx((prev) => (prev + 1) % CHAPTERS.length);
      sound.pop();
    }, 8500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIdx, isPlaying]);

  // Automated simulated cursor choreography for each chapter
  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;
    let t3: NodeJS.Timeout;

    if (currentIdx === 0) {
      // Chapter 0: Move to island and expand
      setCursorPos({ x: 480, y: 180 });
      t1 = setTimeout(() => {
        setCursorPos({ x: 390, y: 140 });
        t2 = setTimeout(() => {
          setIsClicking(true);
          sound.click();
          t3 = setTimeout(() => setIsClicking(false), 200);
        }, 1200);
      }, 1000);
    } else if (currentIdx === 1) {
      // Chapter 1: Move to play button and scrubber
      setCursorPos({ x: 300, y: 220 });
      t1 = setTimeout(() => {
        setCursorPos({ x: 390, y: 290 });
        t2 = setTimeout(() => {
          setIsClicking(true);
          sound.click();
          setSimulatedPlaying((v) => !v);
          t3 = setTimeout(() => {
            setIsClicking(false);
            setCursorPos({ x: 460, y: 236 });
            setSimulatedScrub(72);
          }, 400);
        }, 1100);
      }, 1000);
    } else if (currentIdx === 2) {
      // Chapter 2: Move to Bluetooth device info
      setCursorPos({ x: 420, y: 190 });
      t1 = setTimeout(() => {
        setCursorPos({ x: 310, y: 190 });
        t2 = setTimeout(() => {
          setIsClicking(true);
          sound.click();
          t3 = setTimeout(() => setIsClicking(false), 250);
        }, 1200);
      }, 900);
    } else if (currentIdx === 3) {
      // Chapter 3: Toggle focus/break mode
      setCursorPos({ x: 330, y: 260 });
      t1 = setTimeout(() => {
        setCursorPos({ x: 450, y: 260 });
        t2 = setTimeout(() => {
          setIsClicking(true);
          sound.click();
          setSimulatedTimerMode((m) => (m === 'focus' ? 'break' : 'focus'));
          t3 = setTimeout(() => setIsClicking(false), 200);
        }, 1000);
      }, 800);
    } else if (currentIdx === 4) {
      // Chapter 4: Calendar day click
      setCursorPos({ x: 380, y: 210 });
      t1 = setTimeout(() => {
        setCursorPos({ x: 420, y: 200 });
        t2 = setTimeout(() => {
          setIsClicking(true);
          sound.click();
          t3 = setTimeout(() => setIsClicking(false), 200);
        }, 1100);
      }, 900);
    } else if (currentIdx === 5) {
      // Chapter 5: Complete todo task and expand wide mode
      setCursorPos({ x: 310, y: 210 });
      t1 = setTimeout(() => {
        setCursorPos({ x: 310, y: 210 });
        t2 = setTimeout(() => {
          setIsClicking(true);
          sound.click();
          setSimulatedTaskDone((v) => !v);
          t3 = setTimeout(() => {
            setIsClicking(false);
            setCursorPos({ x: 470, y: 140 });
            setSimulatedWide((w) => !w);
          }, 600);
        }, 1200);
      }, 1000);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [currentIdx]);

  return (
    <div className="trailer-overlay">
      {/* Dynamic ambient color glow according to chapter */}
      <div
        className="trailer-ambient"
        style={{
          background: `radial-gradient(800px 500px at 50% 45%, ${ch.accent}26 0%, transparent 70%)`,
        }}
      />

      {/* Top Navigation */}
      <nav className="trailer-nav">
        <div className="trailer-brand">
          <span className="trailer-badge">Widgnot 2.2</span>
          <span className="trailer-title">Product Showcase Trailer</span>
        </div>

        <div className="trailer-nav-actions">
          {/* Audio toggle */}
          <button
            className="icon-btn"
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Matikan suara' : 'Nyalakan suara'}
            title={soundEnabled ? 'Suara Aktif' : 'Suara Mati'}
            style={{ color: 'var(--label)', background: 'rgba(255, 255, 255, 0.08)' }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Close button */}
          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Tutup trailer"
            title="Tutup (Esc)"
            style={{ color: 'var(--label)', background: 'rgba(255, 255, 255, 0.08)' }}
          >
            ✕
          </button>
        </div>
      </nav>

      {/* Main Showcase Stage */}
      <div className="trailer-stage">
        <div className="trailer-screen-frame">
          {/* Simulated macOS / Windows Topbar */}
          <div className="trailer-screen-topbar">
            <span>Widgnot Desktop Space</span>
            <span>Tue 03 Nov &nbsp; <b>10:16 AM</b></span>
          </div>

          {/* Animated Cursor */}
          <motion.div
            className={`trailer-cursor ${isClicking ? 'trailer-cursor-clicking' : ''}`}
            animate={{ left: cursorPos.x, top: cursorPos.y }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 3l7 18 3.5-7.5L21 10 3 3z"
                fill="#ffffff"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            {isClicking && <div className="trailer-click-ripple" />}
          </motion.div>

          {/* Interactive Simulated Island */}
          <div className="trailer-island-slot">
            <AnimatePresence mode="wait">
              {currentIdx === 0 && (
                /* Chapter 0: Idle Pill morphing into Liquid Capsule */
                <motion.div
                  key="scene-island"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={contentSpring}
                  style={{
                    width: 380,
                    borderRadius: 34,
                    background: 'rgba(24, 24, 28, 0.84)',
                    backdropFilter: 'blur(28px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    boxShadow: '0 24px 60px -8px rgba(0, 0, 0, 0.75), 0 0 0 0.5px rgba(255, 255, 255, 0.08)',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid var(--separator)', paddingBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#30d158' }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--label)' }}>Dynamic Island</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--secondary-label)' }}>Tue 03 Nov · 10:16 AM</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '4px 0' }}>
                    <div style={{ width: 60, height: 60, borderRadius: 20, background: 'rgba(255,255,255,0.08)', display: 'grid', placeItems: 'center' }}>
                      <span style={{ fontSize: 28 }}>⚡</span>
                    </div>
                    <div>
                      <b style={{ display: 'block', fontSize: 16, color: 'var(--label)' }}>Liquid Spring Motion</b>
                      <span style={{ fontSize: 13, color: 'var(--secondary-label)' }}>Mengapung & menempel di dock tepi layar</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentIdx === 1 && (
                /* Chapter 1: Music Player & Scrubber */
                <motion.div
                  key="scene-music"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={contentSpring}
                  style={{
                    width: 400,
                    borderRadius: 34,
                    background: 'rgba(24, 24, 28, 0.84)',
                    backdropFilter: 'blur(28px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    boxShadow: '0 24px 60px -8px rgba(0, 0, 0, 0.75)',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid var(--separator)', paddingBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 3, height: 12, background: '#ff2a85', borderRadius: 2 }} />
                      <span style={{ width: 3, height: 18, background: '#ff2a85', borderRadius: 2 }} />
                      <span style={{ width: 3, height: 10, background: '#ff2a85', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--secondary-label)' }}>Now Playing · Spotify Sync</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, #1e1e24 0%, #2b2b36 100%)', display: 'grid', placeItems: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}>
                      <Disc size={34} color="#ff2a85" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ display: 'block', fontSize: 16, color: 'var(--label)' }}>Earrings (Official Visualizer)</b>
                      <span style={{ fontSize: 13, color: 'var(--secondary-label)' }}>Malcolm Todd</span>
                    </div>
                  </div>

                  {/* 4px Progress Scrubber */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ width: '100%', height: 4, borderRadius: 10, background: 'rgba(255,255,255,0.16)', position: 'relative' }}>
                      <div style={{ width: `${simulatedScrub}%`, height: '100%', background: '#ffffff', borderRadius: 10 }} />
                      <div style={{ position: 'absolute', left: `${simulatedScrub}%`, top: -4, width: 12, height: 12, borderRadius: '50%', background: '#ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.5)', transform: 'translateX(-50%)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--secondary-label)', fontVariantNumeric: 'tabular-nums' }}>
                      <span>01:12</span>
                      <span>02:32</span>
                    </div>
                  </div>

                  {/* Play Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                    <Skip dir="prev" size={22} style={{ color: 'var(--secondary-label)' }} />
                    <button style={{ width: 48, height: 48, borderRadius: '50%', background: '#ffffff', color: '#000000', display: 'grid', placeItems: 'center', border: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}>
                      {simulatedPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <Skip size={22} style={{ color: 'var(--secondary-label)' }} />
                  </div>
                </motion.div>
              )}

              {currentIdx === 2 && (
                /* Chapter 2: AirPods & Bluetooth Battery Status */
                <motion.div
                  key="scene-bt"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={contentSpring}
                  style={{
                    width: 390,
                    borderRadius: 34,
                    background: 'rgba(24, 24, 28, 0.84)',
                    backdropFilter: 'blur(28px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    boxShadow: '0 24px 60px -8px rgba(0, 0, 0, 0.75)',
                    padding: '20px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 22,
                  }}
                >
                  <div style={{ position: 'relative', width: 78, height: 78, display: 'grid', placeItems: 'center' }}>
                    <svg width="78" height="78" viewBox="0 0 84 84" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="42" cy="42" r="37.5" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="6" />
                      <circle cx="42" cy="42" r="37.5" fill="none" stroke="#00c6ff" strokeWidth="6" strokeLinecap="round" strokeDasharray="235.6" strokeDashoffset="18" />
                    </svg>
                    <div style={{ position: 'absolute', width: 60, height: 60, borderRadius: '50%', background: '#18181c', display: 'grid', placeItems: 'center', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}>
                      <AirPods size={30} style={{ color: '#00c6ff' }} />
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 14, color: 'var(--secondary-label)', fontWeight: 500 }}>AirPods Pro (2nd Gen)</span>
                    <div style={{ display: 'flex', gap: 16, fontSize: 28, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--label)' }}>
                      <span><span style={{ fontSize: 20, color: 'var(--secondary-label)' }}>L </span>95%</span>
                      <span><span style={{ fontSize: 20, color: 'var(--secondary-label)' }}>R </span>95%</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentIdx === 3 && (
                /* Chapter 3: Focus Timer */
                <motion.div
                  key="scene-timer"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={contentSpring}
                  style={{
                    width: 390,
                    borderRadius: 34,
                    background: 'rgba(24, 24, 28, 0.84)',
                    backdropFilter: 'blur(28px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    boxShadow: '0 24px 60px -8px rgba(0, 0, 0, 0.75)',
                    padding: '20px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                  }}
                >
                  <div style={{ position: 'relative', width: 78, height: 78, display: 'grid', placeItems: 'center' }}>
                    <svg width="78" height="78" viewBox="0 0 84 84" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="42" cy="42" r="37" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="6" />
                      <circle cx="42" cy="42" r="37" fill="none" stroke="#ff453a" strokeWidth="6" strokeLinecap="round" strokeDasharray="232" strokeDashoffset="48" />
                    </svg>
                    <div style={{ position: 'absolute' }}>
                      <Stopwatch size={38} style={{ color: '#ff453a' }} />
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--secondary-label)', fontWeight: 600 }}>
                      {simulatedTimerMode === 'focus' ? 'Fokus Time' : 'Break Time'}
                    </span>
                    <span style={{ fontSize: 38, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--label)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                      24:18
                    </span>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: simulatedTimerMode === 'focus' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)', color: 'var(--label)' }}>
                        Focus
                      </span>
                      <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: simulatedTimerMode === 'break' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)', color: 'var(--label)' }}>
                        Break
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentIdx === 4 && (
                /* Chapter 4: Calendar & Deadline Reminders */
                <motion.div
                  key="scene-calendar"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={contentSpring}
                  style={{
                    width: 400,
                    borderRadius: 34,
                    background: 'rgba(24, 24, 28, 0.84)',
                    backdropFilter: 'blur(28px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    boxShadow: '0 24px 60px -8px rgba(0, 0, 0, 0.75)',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid var(--separator)', paddingBottom: 10 }}>
                    <b style={{ fontSize: 16, color: 'var(--label)' }}>November 2026</b>
                    <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 8, background: 'rgba(10, 132, 255, 0.18)', color: 'var(--system-blue)', fontWeight: 600 }}>+ Add Task</span>
                  </div>

                  <div style={{ background: 'var(--fill)', borderRadius: 14, padding: '10px 14px', border: '0.5px solid var(--separator)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CalendarDays size={18} style={{ color: 'var(--secondary-label)' }} />
                      <span style={{ fontSize: 14, color: 'var(--label)', fontWeight: 500 }}>Project Launch Review</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--secondary-label)', fontVariantNumeric: 'tabular-nums' }}>16:00 WIB</span>
                  </div>

                  {/* Deadline Alert Pill */}
                  <div style={{ background: 'rgba(255, 159, 10, 0.15)', border: '0.5px solid rgba(255, 159, 10, 0.35)', borderRadius: 12, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>⏰</span>
                    <span style={{ fontSize: 12.5, color: '#ffb340', fontWeight: 500 }}>
                      Batas waktu: <b>10 Menit Lagi</b> — Maskot akan memberikan pengingat interaktif!
                    </span>
                  </div>
                </motion.div>
              )}

              {currentIdx === 5 && (
                /* Chapter 5: Reminders & Wide Note Scratchpad */
                <motion.div
                  key="scene-notes"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={contentSpring}
                  style={{
                    width: simulatedWide ? 440 : 390,
                    borderRadius: 34,
                    background: 'rgba(24, 24, 28, 0.84)',
                    backdropFilter: 'blur(28px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    boxShadow: '0 24px 60px -8px rgba(0, 0, 0, 0.75)',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    transition: 'width 0.3s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid var(--separator)', paddingBottom: 10 }}>
                    <b style={{ fontSize: 16, color: 'var(--label)' }}>Notes &amp; Scratchpad</b>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, background: 'var(--secondary-fill)', color: 'var(--secondary-label)' }}>42 words</span>
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, background: 'var(--system-blue)', color: '#ffffff', fontWeight: 600 }}>Save</span>
                    </div>
                  </div>

                  {/* Todo Item Row */}
                  <div
                    style={{
                      background: simulatedTaskDone ? 'rgba(48, 209, 88, 0.1)' : 'var(--fill)',
                      border: simulatedTaskDone ? '0.5px solid rgba(48, 209, 88, 0.3)' : '0.5px solid var(--separator)',
                      borderRadius: 14,
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {simulatedTaskDone ? <CheckCircle size={18} style={{ color: 'var(--system-green)' }} /> : <Circle size={18} style={{ color: 'var(--secondary-label)' }} />}
                      <span style={{ fontSize: 14, color: simulatedTaskDone ? 'var(--tertiary-label)' : 'var(--label)', textDecoration: simulatedTaskDone ? 'line-through' : 'none', fontWeight: 500 }}>
                        Review Apple HIG compliance
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--secondary-label)' }}>Today</span>
                  </div>

                  <p style={{ margin: 0, fontSize: 13, color: 'var(--secondary-label)', lineHeight: 1.5 }}>
                    "Antarmuka Widgnot didesain responsif dengan continuous squircle, hairline borders, dan dynamic island physics."
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Lower Feature Caption */}
          <div className="trailer-caption">
            <motion.h3
              key={`title-${ch.id}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {ch.title}
            </motion.h3>
            <motion.p
              key={`desc-${ch.id}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              {ch.desc}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Bottom Timeline Controls */}
      <footer className="trailer-controls">
        {/* Chapter Switcher Tabs */}
        <div className="trailer-chapters">
          {CHAPTERS.map((c, i) => (
            <button
              key={c.id}
              className={`trailer-ch-btn ${i === currentIdx ? 'active' : ''}`}
              onClick={() => selectChapter(i)}
            >
              <span>{i + 1}.</span> {c.title}
            </button>
          ))}
        </div>

        {/* Scrubber Bar */}
        <div
          className="trailer-scrubber-track"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const pct = clickX / rect.width;
            const targetIdx = Math.min(CHAPTERS.length - 1, Math.max(0, Math.floor(pct * CHAPTERS.length)));
            selectChapter(targetIdx);
          }}
        >
          <div
            className="trailer-scrubber-fill"
            style={{ width: `${((currentIdx + 1) / CHAPTERS.length) * 100}%` }}
          />
        </div>

        {/* Toolbar Bar */}
        <div className="trailer-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              className="icon-btn"
              onClick={() => {
                setIsPlaying(!isPlaying);
                sound.click();
              }}
              style={{ color: 'var(--label)', background: 'rgba(255, 255, 255, 0.08)' }}
              title={isPlaying ? 'Jeda' : 'Lanjutkan'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <span className="trailer-time-display">
              Chapter 0{currentIdx + 1} / 0{CHAPTERS.length} · {ch.subtitle}
            </span>
          </div>

          <button className="trailer-btn-action" onClick={tryLive}>
            <span>Buka Fitur Ini Langsung</span>
            <span style={{ fontSize: 16 }}>➔</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
