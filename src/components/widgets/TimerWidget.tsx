import { timerTotal, useTimer } from '@/store/timer';
import { fmtMMSS } from '@/lib/date';
import { Ring } from '../ui/Ring';
import { AddSquare, Cup, Lock, MinusSquare, Pause, Play, Restart, Stopwatch } from '../ui/Icons';

export const TIMER_COLOR = { focus: '#fe2d28', break: '#21c8ff' } as const;

export function TimerWidget() {
  const t = useTimer();
  const color = TIMER_COLOR[t.mode];
  const progress = t.remaining / timerTotal(t);

  return (
    <section className="widget">
      <div className="timer" style={{ paddingTop: 6 }}>
        <span style={{ position: 'relative', width: 84, height: 84, display: 'grid', placeItems: 'center', flex: 'none', filter: `drop-shadow(0 0 10px ${color}66)` }}>
          <Ring size={84} stroke={10} progress={progress} color={color} track={`${color}33`} />
          <span style={{ position: 'absolute' }}><Stopwatch size={44} /></span>
        </span>

        <div className="timer__body">
          <div>
            <div className="timer__label">{t.mode === 'focus' ? 'fokus time' : 'break time'}</div>
            <div className="timer__line">
              <div className="timer__time">
                <button className="icon-btn" onClick={() => t.adjust(-1)} disabled={t.running} aria-label="Kurangi 5 menit"><MinusSquare /></button>
                <span>{fmtMMSS(t.remaining)}</span>
                <button className="icon-btn" onClick={() => t.adjust(1)} disabled={t.running} aria-label="Tambah 5 menit"><AddSquare /></button>
              </div>
              <button className="icon-btn" onClick={t.reset} aria-label="Reset"><Restart /></button>
            </div>
          </div>
          <div className="timer__chips">
            <button className={`seg ${t.mode === 'break' ? 'seg--on' : ''}`} onClick={() => t.setMode('break')}><Cup />break time</button>
            <button className="play" onClick={t.toggle} aria-label={t.running ? 'Jeda' : 'Mulai'} style={{ background: color, color: t.mode === 'focus' ? '#fff' : '#06232b' }}>
              {t.running ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button className={`seg ${t.mode === 'focus' ? 'seg--on' : ''}`} onClick={() => t.setMode('focus')}><Lock />fokus time</button>
          </div>
        </div>
      </div>
    </section>
  );
}
