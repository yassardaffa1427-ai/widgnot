import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  AnimatePresence, animate, motion, useDragControls, useMotionValue, useReducedMotion,
} from 'motion/react';
import { useUI, type PageId } from '@/store/ui';
import { useData } from '@/store/data';
import { useViewport } from '@/lib/hooks';
import { contentSpring, instant, islandSpring, snapSpring } from '@/lib/motion';
import { Navbar } from './Navbar';
import { Pager } from './Pager';
import { IdlePill } from './IdlePill';
import { MusicWidget } from '../widgets/MusicWidget';
import { NoteWidget } from '../widgets/NoteWidget';
import { CalendarWidget } from '../widgets/CalendarWidget';
import { TimerWidget } from '../widgets/TimerWidget';
import { TodoWidget } from '../widgets/TodoWidget';

const WIDGETS: Record<PageId, () => JSX.Element> = {
  music: MusicWidget, note: NoteWidget, calendar: CalendarWidget, timer: TimerWidget, todo: TodoWidget,
};

const IDLE = 84;        // ukuran pill
const W = 416;          // lebar panel
const W_WIDE = 584;     // lebar editor catatan maksimal
const MARGIN = 16;      // jarak ke tepi layar
const TAB = 26;         // bagian pill yang mengintip saat auto-hide
type Dock = 'left' | 'right' | null;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

const pageV = {
  enter: (d: number) => ({ x: d * 36, opacity: 0, filter: 'blur(8px)', scale: 0.97 }),
  center: { x: 0, opacity: 1, filter: 'blur(0px)', scale: 1 },
  exit: (d: number) => ({ x: -d * 36, opacity: 0, filter: 'blur(8px)', scale: 0.97 }),
};

export const FIGMA_HEIGHTS: Record<PageId, number> = {
  music: 315,
  note: 385,
  calendar: 670,
  timer: 232,
  todo: 365,
};

export function Island() {
  const { open, page, dir, wide, addingAct, setOpen, goTo } = useUI();
  const autoHide = useData((s) => s.autoHide);
  const reduce = useReducedMotion();
  const vp = useViewport();
  const controls = useDragControls();

  const x = useMotionValue(0);
  const y = useMotionValue(70);
  const [dock, setDock] = useState<Dock>('right');
  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragged = useRef(false);

  const targetW = open ? (page === 'note' && wide ? W_WIDE : W) : IDLE;
  const targetH = open
    ? (page === 'note' && wide ? 436 : (page === 'todo' && addingAct ? 785 : FIGMA_HEIGHTS[page]))
    : IDLE;
  const w = targetW;
  const h = Math.min(targetH, vp.h - MARGIN * 2);
  const spring = reduce ? instant : islandSpring;

  // posisi awal: tepi kanan
  useLayoutEffect(() => { x.set(window.innerWidth - IDLE - MARGIN); }, [x]);

  // jaga posisi saat ukuran berubah: menempel ke sisi dock (tumbuh dari tepi) atau di-clamp
  useEffect(() => {
    const maxX = vp.w - w - MARGIN;
    const maxY = vp.h - h - MARGIN;
    const tx = dock === 'left' ? MARGIN : dock === 'right' ? maxX : clamp(x.get(), MARGIN, maxX);
    const ty = clamp(y.get(), MARGIN, maxY);
    const a = animate(x, tx, spring);
    const b = animate(y, ty, spring);
    return () => { a.stop(); b.stop(); };
  }, [w, h, dock, vp.w, vp.h, spring, x, y]);

  // Esc = tutup, Alt+W = toggle
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

  useEffect(() => {
    if (open) {
      window.electronAPI?.setInteractive(true);
    } else if (!hover) {
      window.electronAPI?.setInteractive(false);
    }
  }, [open, hover]);

  const onDragEnd = () => {
    setDragging(false);
    const maxX = vp.w - w - MARGIN;
    const maxY = vp.h - h - MARGIN;
    const s = reduce ? instant : snapSpring;
    animate(y, clamp(y.get(), MARGIN, maxY), s);
    if (!open) {
      // pill: magnet ke tepi terdekat
      const side: Dock = x.get() + w / 2 < vp.w / 2 ? 'left' : 'right';
      setDock(side);
      animate(x, side === 'left' ? MARGIN : maxX, s);
    } else {
      setDock(null);
      animate(x, clamp(x.get(), MARGIN, maxX), s);
    }
  };

  const peek = !open && autoHide && dock !== null && !hover && !dragging;
  const peekX = dock === 'left' ? -(IDLE - TAB + MARGIN) : IDLE - TAB + MARGIN;
  const origin = dock === 'left' ? 'top left' : 'top right';
  const Widget = WIDGETS[page];

  return (
    <div className="stage">
      <motion.div
        className="dock"
        style={{ x, y }}
        drag dragControls={controls} dragListener={false} dragMomentum={false}
        onDragStart={() => { dragged.current = true; setDragging(true); }}
        onDragEnd={onDragEnd}
        onPointerEnter={() => {
          setHover(true);
          window.electronAPI?.setInteractive(true);
        }}
        onPointerLeave={() => {
          setHover(false);
          if (!open) window.electronAPI?.setInteractive(false);
        }}
      >
        <motion.div animate={{ x: peek ? peekX : 0 }} transition={reduce ? instant : snapSpring}>
          <motion.div className="island" initial={false} animate={{ width: w, height: h }} transition={spring}>
            <AnimatePresence initial={false} mode="popLayout">
              {open ? (
                <motion.div
                  key="panel" className="panel" style={{ width: '100%', height: '100%', transformOrigin: origin }}
                  initial={{ opacity: 0, scale: 0.9, filter: 'blur(12px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transition: { ...contentSpring, delay: reduce ? 0 : 0.07 } }}
                  exit={{ opacity: 0, scale: 0.9, filter: 'blur(12px)', transition: { duration: 0.14 } }}
                >
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
                </motion.div>
              ) : (
                <motion.button
                  key="pill" className="pill" aria-label="Buka Widgnot"
                  initial={{ opacity: 0, scale: 0.6, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transition: { ...contentSpring, delay: reduce ? 0 : 0.05 } }}
                  exit={{ opacity: 0, scale: 0.6, filter: 'blur(8px)', transition: { duration: 0.12 } }}
                  onPointerDown={(e) => { dragged.current = false; controls.start(e); }}
                  onClick={() => {
                    if (!dragged.current) {
                      goTo('music');
                      setOpen(true);
                    }
                  }}
                >
                  <IdlePill />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
