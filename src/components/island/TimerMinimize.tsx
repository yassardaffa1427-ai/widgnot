import type { DragControls } from 'motion/react';
import { useTimer } from '@/store/timer';
import { useUI } from '@/store/ui';
import { useNow } from '@/lib/hooks';
import { fmtNavTime, fmtMMSS } from '@/lib/date';
import { BatteryRing } from '../ui/BatteryRing';
import { CloseCircle, Play, Restart } from '../ui/Icons';

interface Props {
  controls: DragControls;
  onDragBegin: () => void;
}

/**
 * Tampilan Minimize Timer (293px x 145px) sesuai Figma node 11:1132 (Break) & 11:1238 (Focus).
 * - Klik X: menutup ke idle timer (84x84 squircle pill).
 * - Klik kartu: memperbesar kembali ke halaman widget timer penuh.
 * - Tombol play/pause kapsul & restart mengontrol timer langsung.
 */
export function TimerMinimize({ controls, onDragBegin }: Props) {
  const timer = useTimer();
  const { setTimerMinimized, setOpen } = useUI();
  const now = useNow();

  const isBreak = timer.mode === 'break';
  const accentColor = isBreak ? '#0091ff' : '#fe2d28';

  const handleCardClick = () => {
    setTimerMinimized(false);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTimerMinimized(false);
    setOpen(false);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={handleCardClick}
    >
      {/* Navbar baris atas (drag handle) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 20px 10px',
          height: 59,
          flexShrink: 0,
          cursor: 'grab',
          touchAction: 'none',
        }}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          onDragBegin();
          controls.start(e);
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BatteryRing />
          <b style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
            {fmtNavTime(now)}
          </b>
        </div>
        <button
          className="icon-btn"
          onClick={handleClose}
          aria-label="Tutup ke idle timer"
          style={{ width: 29, height: 29 }}
        >
          <CloseCircle size={29} />
        </button>
      </div>

      {/* Konten bawah */}
      <div
        style={{
          padding: '0 20px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.35)',
            fontWeight: 400,
            lineHeight: 'normal',
          }}
        >
          {isBreak ? 'Break time' : 'Fokus time'}
        </span>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* Angka countdown 42px bold */}
          <span
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
            }}
          >
            {fmtMMSS(timer.remaining)}
          </span>

          {/* Tombol Play/Pause capsule dan Restart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                timer.toggle();
              }}
              aria-label={timer.running ? 'Jeda timer' : 'Mulai timer'}
              style={{
                width: 59,
                height: 29,
                borderRadius: 30,
                backgroundColor: accentColor,
                border: 'none',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.94)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {timer.running ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <div style={{ width: 3, height: 8, background: '#ffffff', borderRadius: 20 }} />
                  <div style={{ width: 3, height: 8, background: '#ffffff', borderRadius: 20 }} />
                </div>
              ) : (
                <Play size={13} style={{ color: '#ffffff' }} />
              )}
            </button>

            <button
              className="icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                timer.reset();
              }}
              aria-label="Restart timer"
              style={{ width: 24, height: 24 }}
            >
              <Restart size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
