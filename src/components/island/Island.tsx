import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  AnimatePresence, animate, motion, useDragControls, useMotionValue, useReducedMotion,
} from 'motion/react';
import { useUI, type PageId } from '@/store/ui';
import { useData } from '@/store/data';
import { useTimer } from '@/store/timer';
import { useViewport } from '@/lib/hooks';
import { contentSpring, instant, islandSpring, snapSpring } from '@/lib/motion';
import { Navbar } from './Navbar';
import { Pager } from './Pager';
import { IdlePill } from './IdlePill';
import { TimerMinimize } from './TimerMinimize';
import { MusicWidget } from '../widgets/MusicWidget';
import { BluetoothWidget } from '../widgets/BluetoothWidget';
import { NoteWidget } from '../widgets/NoteWidget';
import { CalendarWidget } from '../widgets/CalendarWidget';
import { TimerWidget } from '../widgets/TimerWidget';
import { TodoWidget } from '../widgets/TodoWidget';
import { DropWidget } from '../widgets/DropWidget';

const WIDGETS: Record<PageId, () => JSX.Element> = {
  music: MusicWidget,
  bluetooth: BluetoothWidget,
  note: NoteWidget,
  calendar: CalendarWidget,
  timer: TimerWidget,
  todo: TodoWidget,
  drop: DropWidget,
};

const IDLE = 84;         // ukuran pill
const W = 416;           // lebar panel
const W_WIDE = 584;      // lebar editor catatan maksimal
const W_TIMER_MIN = 293; // lebar minimize timer (node 11:1132)
const H_TIMER_MIN = 145; // tinggi minimize timer (node 11:1132)
const MARGIN = 16;       // jarak ke tepi layar
const HIDE_OFFSET = 42;  // sembunyi setengahnya (42px terlihat, 42px di luar layar)

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

const pageV = {
  enter: (d: number) => ({ x: d * 36, opacity: 0, filter: 'blur(8px)', scale: 0.97 }),
  center: { x: 0, opacity: 1, filter: 'blur(0px)', scale: 1 },
  exit: (d: number) => ({ x: -d * 36, opacity: 0, filter: 'blur(8px)', scale: 0.97 }),
};

export const FIGMA_HEIGHTS: Record<PageId, number> = {
  music: 315,
  bluetooth: 227,
  note: 385,
  calendar: 630,
  timer: 232,
  todo: 365,
  drop: 359,
};

export function Island() {
  const { open, page, dir, wide, addingAct, timerMinimized, dropCompact, setOpen, goTo } = useUI();
  const autoHide = useData((s) => s.autoHide);
  const reduce = useReducedMotion();
  const vp = useViewport();
  const controls = useDragControls();

  const x = useMotionValue(0);
  const y = useMotionValue(70);
  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [isIdleHidden, setIsIdleHidden] = useState(false);
  const [idleDock, setIdleDock] = useState<'left' | 'right'>('right');

  const dragged = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const isTimerMin = open && timerMinimized && page === 'timer';
  const isDropCompact = open && page === 'drop' && dropCompact;

  const targetW = open
    ? (isTimerMin ? W_TIMER_MIN : (page === 'note' && wide ? W_WIDE : W))
    : IDLE;
  const targetH = open
    ? (isTimerMin
        ? H_TIMER_MIN
        : isDropCompact
        ? 245
        : page === 'note' && wide
        ? 436
        : page === 'todo' && addingAct
        ? 785
        : FIGMA_HEIGHTS[page])
    : IDLE;
  const w = targetW;
  const h = Math.min(targetH, vp.h - MARGIN * 2);
  const spring = reduce ? instant : islandSpring;

  // Posisi awal: tepi kanan layar
  useLayoutEffect(() => {
    x.set(Math.max(MARGIN, window.innerWidth - IDLE - MARGIN));
  }, [x]);

  // Hitung mundur 10 detik saat idle tanpa hover/drag untuk auto-hide ke pinggir layar
  useEffect(() => {
    if (open || !autoHide || dragging || hover) {
      if (open || !autoHide || dragging) {
        setIsIdleHidden(false);
      }
      return;
    }

    const timer = setTimeout(() => {
      const curX = x.get();
      const side = curX < vp.w / 2 ? 'left' : 'right';
      setIdleDock(side);
      setIsIdleHidden(true);
    }, 10000); // 10 detik

    return () => clearTimeout(timer);
  }, [open, autoHide, dragging, hover, vp.w, x]);

  // Jaga posisi saat ukuran berubah atau auto-hide / peek
  useEffect(() => {
    const maxX = vp.w - w - MARGIN;
    const maxY = vp.h - h - MARGIN;
    let tx: number;

    if (!open && autoHide && isIdleHidden) {
      // Sembunyi setengahnya (42px mengintip di pinggir layar)
      tx = idleDock === 'left' ? -HIDE_OFFSET : vp.w - HIDE_OFFSET;
    } else if (!open && autoHide && !isIdleHidden && (x.get() < MARGIN || x.get() > maxX)) {
      // Keluar (peek) kembali ke margin tepi layar
      tx = idleDock === 'left' ? MARGIN : maxX;
    } else {
      tx = clamp(x.get(), MARGIN, maxX);
    }

    const ty = clamp(y.get(), MARGIN, maxY);
    const a = animate(x, tx, spring);
    const b = animate(y, ty, spring);
    return () => { a.stop(); b.stop(); };
  }, [w, h, open, autoHide, isIdleHidden, idleDock, vp.w, vp.h, spring, x, y]);

  // Sync bounding box ke desktop overlay Tauri/Electron untuk hit-testing presisi
  useEffect(() => {
    const reportBounds = () => {
      window.electronAPI?.updateWidgetBounds?.({
        x: x.get(),
        y: y.get(),
        w,
        h,
        open,
        dragging,
      });
    };
    reportBounds();
    const unsubX = x.on('change', reportBounds);
    const unsubY = y.on('change', reportBounds);
    return () => {
      unsubX();
      unsubY();
    };
  }, [w, h, open, dragging, x, y]);

  // Esc = tutup, Alt+W = shortcut cadangan
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false);
      if (e.altKey && e.key.toLowerCase() === 'w') {
        if (!open) goTo('music');
        setOpen(!open);
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [open, setOpen, goTo]);

  const openWidget = () => {
    window.electronAPI?.setInteractive(true);
    setIsIdleHidden(false);
    const t = useTimer.getState();
    const isTimerActive = t.running || t.remaining < (t.mode === 'focus' ? t.focusSec : t.breakSec);
    if (isTimerActive) {
      goTo('timer');
    } else {
      goTo('music');
    }
    setOpen(true);
  };

  const onDragEnd = () => {
    setDragging(false);
    const maxX = vp.w - w - MARGIN;
    const maxY = vp.h - h - MARGIN;
    const s = reduce ? instant : snapSpring;
    const finalX = clamp(x.get(), MARGIN, maxX);
    animate(x, finalX, s);
    animate(y, clamp(y.get(), MARGIN, maxY), s);
    setIdleDock(finalX < vp.w / 2 ? 'left' : 'right');
    if (!hover) {
      window.electronAPI?.setInteractive(false);
    }
  };

  const origin = (idleDock === 'left' || x.get() < vp.w / 2) ? 'top left' : 'top right';
  const Widget = WIDGETS[page];

  return (
    <div className="stage">
      <motion.div
        className="dock"
        style={{ x, y }}
        drag dragControls={controls} dragListener={false} dragMomentum={false}
        onDrag={(_, info) => {
          if (Math.hypot(info.offset.x, info.offset.y) > 4) {
            dragged.current = true;
            if (!dragging) setDragging(true);
          }
        }}
        onDragStart={() => {
          dragged.current = true;
          setDragging(true);
          setIsIdleHidden(false);
        }}
        onDragEnd={onDragEnd}
        onPointerEnter={() => {
          setHover(true);
          setIsIdleHidden(false);
          window.electronAPI?.setInteractive(true);
        }}
        onPointerLeave={() => {
          setHover(false);
          // Saat mouse meninggalkan panel island, bebaskan klik ke monitor/aplikasi lain di belakangnya
          if (!dragging) {
            window.electronAPI?.setInteractive(false);
          }
        }}
      >
        {/* Sensor area tambahan agar mouse mendekati pinggir layar langsung auto-peek */}
        {!open && isIdleHidden && (
          <div
            style={{
              position: 'absolute',
              top: -8,
              bottom: -8,
              ...(idleDock === 'right'
                ? { left: -28, width: 28 }
                : { right: -28, width: 28 }),
              pointerEvents: 'auto',
            }}
          />
        )}

        <motion.div className="island" initial={false} animate={{ width: w, height: h }} transition={spring}>
          <AnimatePresence initial={false} mode="popLayout">
            {open ? (
              <motion.div
                key={isTimerMin ? 'timer-min' : 'panel'}
                className="panel"
                style={{ width: '100%', height: '100%', transformOrigin: origin }}
                initial={{ opacity: 0, scale: 0.9, filter: 'blur(12px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transition: { ...contentSpring, delay: reduce ? 0 : 0.07 } }}
                exit={{ opacity: 0, scale: 0.9, filter: 'blur(12px)', transition: { duration: 0.14 } }}
              >
                {isTimerMin ? (
                  <TimerMinimize controls={controls} onDragBegin={() => { dragged.current = false; }} />
                ) : (
                  <>
                    <Navbar controls={controls} onDragBegin={() => { dragged.current = false; }} />
                    <div className="body">
                      <div className="body__scroll">
                        <AnimatePresence initial={false} mode="wait" custom={dir}>
                          <motion.div
                            key={page} custom={dir} variants={pageV} initial="enter" animate="center" exit="exit"
                            transition={contentSpring}
                          >
                            <Widget />
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                    <Pager />
                  </>
                )}
              </motion.div>
            ) : (
              <motion.button
                key="pill" className="pill" aria-label="Buka Widgnot"
                initial={{ opacity: 0, scale: 0.6, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transition: { ...contentSpring, delay: reduce ? 0 : 0.05 } }}
                exit={{ opacity: 0, scale: 0.6, filter: 'blur(8px)', transition: { duration: 0.12 } }}
                onPointerDown={(e) => {
                  startPos.current = { x: e.clientX, y: e.clientY };
                  dragged.current = false;
                  controls.start(e);
                }}
                onPointerUp={(e) => {
                  const dx = startPos.current ? Math.abs(e.clientX - startPos.current.x) : 0;
                  const dy = startPos.current ? Math.abs(e.clientY - startPos.current.y) : 0;
                  if (!dragged.current || (dx < 6 && dy < 6)) {
                    openWidget();
                  }
                }}
                onClick={(e) => {
                  e.preventDefault();
                  if (!dragged.current) {
                    openWidget();
                  }
                }}
              >
                <IdlePill isLeftDock={idleDock === 'left' || x.get() < vp.w / 2} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
