import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TimerSquirclePill } from '../ui/TimerSquirclePill';
import { EqBars } from '../ui/EqBars';
import { Mascot } from '../ui/Mascot';
import { Disc } from '../ui/Icons';
import { useMusic } from '@/store/music';
import { timerTotal, useTimer } from '@/store/timer';
import { useData } from '@/store/data';
import { useUI } from '@/store/ui';
import { getUpcomingDeadline, type DeadlineAlert } from '@/lib/deadline';
import { contentSpring } from '@/lib/motion';

/**
 * Isi pill 84x84. Prioritas: timer berjalan > musik diputar > maskot.
 * Dilengkapi animasi idle warning/marah & bubble chat interaktif manusiawi
 * yang muncul setiap 60 detik dengan opsi Matikan / 1 Menit Lagi.
 */
interface IdlePillProps {
  isLeftDock?: boolean;
}

export function IdlePill({ isLeftDock = false }: IdlePillProps) {
  const timer = useTimer();
  const { playing, tracks, index } = useMusic();
  const activities = useData((s) => s.activities);
  const { goTo, setOpen } = useUI();

  // Polling deadline setiap 10 detik agar realtime
  const [deadlineAlert, setDeadlineAlert] = useState<DeadlineAlert | null>(() =>
    getUpcomingDeadline(activities)
  );

  // State manajemen siklus 60 detik & interaktivitas bubble
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [snoozedUntil, setSnoozedUntil] = useState<number>(0);
  const [dismissedTaskId, setDismissedTaskId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const update = () => {
      setDeadlineAlert(getUpcomingDeadline(useData.getState().activities));
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, [activities]);

  // Siklus kemunculan bubble setiap 60 detik sekali
  useEffect(() => {
    if (!deadlineAlert) {
      setIsBubbleVisible(false);
      setIsExpanded(false);
      return;
    }

    // Jika task ini sudah dimatikan pengingatnya oleh pengguna
    if (dismissedTaskId === deadlineAlert.id) {
      setIsBubbleVisible(false);
      setIsExpanded(false);
      return;
    }

    const checkAndTrigger = () => {
      const now = Date.now();
      // Jangan tampilkan jika masih dalam periode tunda (snooze)
      if (now < snoozedUntil) return;
      if (dismissedTaskId === deadlineAlert.id) return;

      setIsBubbleVisible(true);
    };

    // Munculkan segera saat pertama kali mendeteksi ada deadline dekat
    checkAndTrigger();

    // Jalankan siklus setiap 60 detik (1 menit)
    const cycleInterval = setInterval(() => {
      checkAndTrigger();
    }, 60000);

    return () => clearInterval(cycleInterval);
  }, [deadlineAlert?.id, snoozedUntil, dismissedTaskId]);

  // Auto-hide bubble setelah 12 detik jika tidak sedang dibuka (isExpanded) dan tidak sedang di-hover
  useEffect(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (!isBubbleVisible || isExpanded || isHovered || feedbackMsg) return;

    hideTimerRef.current = setTimeout(() => {
      setIsBubbleVisible(false);
    }, 12000);

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [isBubbleVisible, isExpanded, isHovered, feedbackMsg]);

  const isTimerActive = timer.running || timer.remaining < timerTotal(timer);
  const hasMusic = playing && tracks[index];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
      {/* Interactive Speech Bubble reminder di atas idle icon */}
      <AnimatePresence>
        {deadlineAlert && isBubbleVisible && dismissedTaskId !== deadlineAlert.id && (
          <motion.div
            key="deadline-bubble"
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{
              opacity: 1,
              y: isHovered || isExpanded ? 0 : [0, -3, 0],
              scale: 1,
            }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={contentSpring}
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
              if (!isExpanded && !feedbackMsg) {
                setIsExpanded(true);
              }
            }}
            title={isExpanded ? '' : 'Klik untuk opsi pengingat'}
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 14px)',
              ...(isLeftDock ? { left: 0 } : { right: 0 }),
              width: isExpanded ? 310 : 'max-content',
              maxWidth: 330,
              backgroundColor: 'rgba(20, 20, 24, 0.96)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border:
                deadlineAlert.urgency === 'angry'
                  ? '1px solid rgba(255, 51, 75, 0.45)'
                  : '1px solid rgba(255, 170, 0, 0.45)',
              boxShadow:
                deadlineAlert.urgency === 'angry'
                  ? '0 8px 32px rgba(0, 0, 0, 0.65), 0 0 16px rgba(255, 51, 75, 0.25)'
                  : '0 8px 32px rgba(0, 0, 0, 0.65), 0 0 16px rgba(255, 170, 0, 0.25)',
              color: '#ffffff',
              borderRadius: 20,
              padding: isExpanded ? '14px 16px' : '10px 16px',
              zIndex: 100,
              pointerEvents: 'auto',
              cursor: isExpanded ? 'default' : 'pointer',
              userSelect: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {feedbackMsg ? (
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  textAlign: 'center',
                  padding: '8px 4px',
                  color: '#00ffc4',
                  letterSpacing: '-0.01em',
                }}
              >
                {feedbackMsg}
              </div>
            ) : isExpanded ? (
              /* Expanded Options Card saat bubble diklik */
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>
                      {deadlineAlert.urgency === 'angry' ? '🚨' : '⏳'}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: deadlineAlert.urgency === 'angry' ? '#ff4d64' : '#ffb703',
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {deadlineAlert.urgency === 'angry' ? 'Deadline Mendekat!' : 'Pengingat Deadline'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.45)',
                      cursor: 'pointer',
                      padding: 2,
                      fontSize: 13,
                      lineHeight: 1,
                    }}
                    title="Tutup menu"
                  >
                    ✕
                  </button>
                </div>

                <div style={{ fontSize: 13, lineHeight: 1.45, color: 'rgba(255, 255, 255, 0.92)', fontWeight: 400 }}>
                  {deadlineAlert.humanMessage}
                </div>

                <div style={{ fontSize: 11.5, color: 'rgba(255, 255, 255, 0.5)', margin: '2px 0 2px 0' }}>
                  Batas waktu: <b>{deadlineAlert.timeRemainingDisplay}</b> ({deadlineAlert.timeStr})
                </div>

                {/* Tombol Opsi: Matikan | Ingatkan 1 Menit Lagi | Buka Task */}
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFeedbackMsg('Pengingat dimatikan 👍');
                      setTimeout(() => {
                        setDismissedTaskId(deadlineAlert.id);
                        setIsExpanded(false);
                        setIsBubbleVisible(false);
                        setFeedbackMsg(null);
                      }, 1100);
                    }}
                    style={{
                      flex: 1,
                      padding: '7px 8px',
                      borderRadius: 10,
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    title="Matikan pengingat untuk task ini"
                  >
                    🔕 Matikan
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFeedbackMsg('Siap, diingatkan 1 menit lagi! ⏰');
                      setTimeout(() => {
                        setSnoozedUntil(Date.now() + 60000);
                        setIsExpanded(false);
                        setIsBubbleVisible(false);
                        setFeedbackMsg(null);
                      }, 1100);
                    }}
                    style={{
                      flex: 1.25,
                      padding: '7px 8px',
                      borderRadius: 10,
                      backgroundColor:
                        deadlineAlert.urgency === 'angry'
                          ? 'rgba(255, 51, 75, 0.25)'
                          : 'rgba(255, 170, 0, 0.25)',
                      border:
                        deadlineAlert.urgency === 'angry'
                          ? '1px solid rgba(255, 51, 75, 0.55)'
                          : '1px solid rgba(255, 170, 0, 0.55)',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    title="Ingatkan kembali 1 menit ke depan"
                  >
                    ⏱️ 1 Menit Lagi
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(false);
                      goTo('todo');
                      setOpen(true);
                    }}
                    style={{
                      padding: '7px 10px',
                      borderRadius: 10,
                      backgroundColor: 'rgba(0, 198, 255, 0.15)',
                      border: '1px solid rgba(0, 198, 255, 0.35)',
                      color: '#00c6ff',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    title="Buka daftar To-Do"
                  >
                    📋 Buka
                  </button>
                </div>
              </>
            ) : (
              /* Compact Reminder Bubble (Default tampilan manusiawi) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.4, letterSpacing: '-0.01em' }}>
                  {deadlineAlert.humanMessage}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    color: 'rgba(255, 255, 255, 0.45)',
                    marginTop: 1,
                  }}
                >
                  <span>⏳ {deadlineAlert.timeRemainingDisplay}</span>
                  <span
                    style={{
                      color: deadlineAlert.urgency === 'angry' ? '#ff4d64' : '#ffb703',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Klik opsi ▾
                  </span>
                </div>
              </div>
            )}

            {/* Triangular tail pointing down towards the mascot */}
            <div
              style={{
                position: 'absolute',
                bottom: -7,
                ...(isLeftDock ? { left: 34 } : { right: 34 }),
                width: 0,
                height: 0,
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: '7px solid #141418',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Pill Content */}
      {isTimerActive ? (
        <div style={{ width: '100%', height: '100%', pointerEvents: 'none', userSelect: 'none' }}>
          <TimerSquirclePill
            remaining={timer.remaining}
            total={timerTotal(timer)}
            mode={timer.mode}
          />
        </div>
      ) : hasMusic ? (
        <div
          style={{
            position: 'relative',
            width: 84,
            height: 84,
            borderRadius: 34,
            overflow: 'hidden',
            display: 'grid',
            placeItems: 'center',
            backgroundColor: '#1b1b1b',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {/* Efek blur warna dinamis sesuai gambar thumbnail */}
          {tracks[index].thumbnail ? (
            <div
              style={{
                position: 'absolute',
                width: 82,
                height: 56,
                top: 28,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundImage: `url(${tracks[index].thumbnail})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(16px)',
                opacity: 0.9,
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 1,
              }}
            />
          ) : null}

          {/* Thumbnail utama 60x60 r22 */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              width: 60,
              height: 60,
              borderRadius: 22,
              overflow: 'hidden',
              backgroundColor: '#383838',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.12)',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {tracks[index].thumbnail ? (
              <img
                src={tracks[index].thumbnail}
                alt={tracks[index].name}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  borderRadius: 22,
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  pointerEvents: 'none',
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Disc size={28} color="rgba(255, 255, 255, 0.45)" />
            )}
          </div>

          {/* Equalizer bars 3 bar dengan border hitam di bawah */}
          <div
            style={{
              position: 'absolute',
              zIndex: 3,
              bottom: 6,
              left: '50%',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
              userSelect: 'none',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
            }}
          >
            <EqBars active bordered size={18} />
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'grid', placeItems: 'center', pointerEvents: 'none', userSelect: 'none' }}>
          <Mascot size={84} urgency={deadlineAlert?.urgency ?? 'normal'} />
        </div>
      )}
    </div>
  );
}
