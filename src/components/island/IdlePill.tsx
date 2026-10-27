import { TimerSquirclePill } from '../ui/TimerSquirclePill';
import { EqBars } from '../ui/EqBars';
import { Mascot } from '../ui/Mascot';
import { Disc } from '../ui/Icons';
import { useMusic } from '@/store/music';
import { timerTotal, useTimer } from '@/store/timer';

/**
 * Isi pill 84x84. Prioritas: timer berjalan > musik diputar > maskot.
 */
export function IdlePill() {
  const timer = useTimer();
  const { playing, tracks, index } = useMusic();

  const isTimerActive = timer.running || timer.remaining < timerTotal(timer);
  if (isTimerActive) {
    return (
      <TimerSquirclePill
        remaining={timer.remaining}
        total={timerTotal(timer)}
        mode={timer.mode}
      />
    );
  }

  if (playing && tracks[index]) {
    const trk = tracks[index];
    return (
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
        }}
      >
        {/* Efek blur warna dinamis sesuai gambar thumbnail (Figma 5:2911 / Group 3) */}
        {trk.thumbnail ? (
          <div
            style={{
              position: 'absolute',
              width: 82,
              height: 56,
              top: 28,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundImage: `url(${trk.thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(16px)',
              opacity: 0.9,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        ) : null}

        {/* Thumbnail utama 60x60 r22 (Figma 5:2901 / Rectangle 1) */}
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
          }}
        >
          {trk.thumbnail ? (
            <img
              src={trk.thumbnail}
              alt={trk.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                borderRadius: 22,
              }}
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <Disc size={28} color="rgba(255, 255, 255, 0.45)" />
          )}
        </div>

        {/* Equalizer bars 3 bar dengan border hitam di bawah (Figma 5:2905 / music on) */}
        <div
          style={{
            position: 'absolute',
            zIndex: 3,
            bottom: 6,
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
          }}
        >
          <EqBars active bordered size={18} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
      <Mascot size={84} />
    </div>
  );
}
