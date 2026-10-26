import type { DragControls } from 'motion/react';
import { useUI } from '@/store/ui';
import { useMusic } from '@/store/music';
import { useNow } from '@/lib/hooks';
import { fmtNavDate, fmtNavTime } from '@/lib/date';
import { BatteryRing } from '../ui/BatteryRing';
import { EqBars } from '../ui/EqBars';
import { CloseCircle } from '../ui/Icons';

/** Navbar island. Area kosong = drag handle; tombol tetap bisa diklik. */
export function Navbar({ controls, onDragBegin }: { controls: DragControls; onDragBegin: () => void }) {
  const now = useNow();
  const { setOpen, goTo } = useUI();
  const { playing, hasActiveMedia } = useMusic();

  return (
    <div
      className="navbar"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onDragBegin();
        controls.start(e);
      }}
    >
      <button className="icon-btn" onClick={() => goTo('music')} aria-label="Buka music"><EqBars active={hasActiveMedia && playing} /></button>
      <div className="navbar__center">
        <BatteryRing />
        <span>{fmtNavDate(now)}</span>
        <b>{fmtNavTime(now)}</b>
      </div>
      <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Tutup"><CloseCircle /></button>
    </div>
  );
}
