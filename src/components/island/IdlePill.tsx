import { Ring } from '../ui/Ring';
import { EqBars } from '../ui/EqBars';
import { Mascot } from '../ui/Mascot';
import { coverFor, useMusic } from '@/store/music';
import { timerTotal, useTimer } from '@/store/timer';
import { TIMER_COLOR } from '../widgets/TimerWidget';
import { fmtMMSS } from '@/lib/date';

/**
 * Isi pill 84x84. Prioritas: timer berjalan > musik diputar > maskot / tanggal.
 */
export function IdlePill() {
  const timer = useTimer();
  const { playing, tracks, index, hasActiveMedia } = useMusic();

  if (timer.running) {
    return (
      <>
        <Ring size={84} stroke={7} progress={timer.remaining / timerTotal(timer)} color={TIMER_COLOR[timer.mode]} track={`${TIMER_COLOR[timer.mode]}33`} />
        <span className="pill__time">{fmtMMSS(timer.remaining)}</span>
      </>
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
