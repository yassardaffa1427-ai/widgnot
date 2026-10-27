import type { DragControls } from 'motion/react';
import { useUI } from '@/store/ui';
import { useMusic } from '@/store/music';
import { useTimer, timerTotal } from '@/store/timer';
import { useNow } from '@/lib/hooks';
import { fmtNavDate, fmtNavTime } from '@/lib/date';
import { BatteryRing } from '../ui/BatteryRing';
import { EqBars } from '../ui/EqBars';
import { CloseCircle } from '../ui/Icons';

/** Navbar island. Area kosong = drag handle; tombol tetap bisa diklik. */
export function Navbar({ controls, onDragBegin }: { controls: DragControls; onDragBegin: () => void }) {
  const now = useNow();
  const { setOpen, goTo, page, setTimerMinimized } = useUI();
  const { playing, hasActiveMedia } = useMusic();
  const timer = useTimer();

  const isMusicActive = hasActiveMedia && playing;

  const handleClose = () => {
    const total = timerTotal(timer);
    const isTimerActive = timer.running || timer.remaining < total;
    if (page === 'timer' && isTimerActive) {
      setTimerMinimized(true);
    } else {
      setOpen(false);
    }
  };

  return (
    <div
      className="navbar"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onDragBegin();
        controls.start(e);
      }}
    >
      {isMusicActive ? (
        <button className="icon-btn" onClick={() => goTo('music')} aria-label="Buka music">
          <EqBars active size={29} />
        </button>
      ) : (
        <span style={{ width: 29, height: 29, display: 'inline-block' }} aria-hidden />
      )}
      <div className="navbar__center">
        <BatteryRing />
        <span>{fmtNavDate(now)}</span>
        <b>{fmtNavTime(now)}</b>
      </div>
      <button className="icon-btn" onClick={handleClose} aria-label="Tutup"><CloseCircle /></button>
    </div>
  );
}
