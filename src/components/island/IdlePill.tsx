import { TimerSquirclePill } from '../ui/TimerSquirclePill';
import { EqBars } from '../ui/EqBars';
import { Mascot } from '../ui/Mascot';
import { coverFor, useMusic } from '@/store/music';
import { timerTotal, useTimer } from '@/store/timer';

/**
 * Isi pill 84x84. Prioritas: timer berjalan > musik diputar > maskot.
 */
export function IdlePill() {
  const timer = useTimer();
  const { playing, tracks, index, hasActiveMedia } = useMusic();

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

  if (hasActiveMedia && playing && tracks[index]) {
    return (
      <>
        <div className="pill__cover" style={{ background: coverFor(tracks[index]) }} />
        <span className="pill__eq"><EqBars active size={18} /></span>
      </>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
      <Mascot size={84} />
    </div>
  );
}
