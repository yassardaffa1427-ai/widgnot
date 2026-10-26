import { motion } from 'motion/react';

/** Tiga bar equalizer (ikon "music on" di Figma). Beranimasi saat `active`. */
export function EqBars({ active, size = 29 }: { active: boolean; size?: number }) {
  const bars = [{ h: 8, d: 0 }, { h: 13, d: 0.15 }, { h: 7, d: 0.3 }];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: size, height: size }} aria-hidden>
      {bars.map((b, i) => (
        <motion.i
          key={i}
          style={{ width: 5, borderRadius: 20, background: '#fff', display: 'block', height: b.h, opacity: active ? 1 : 0.55 }}
          animate={active ? { height: [b.h, b.h + 7, b.h - 3, b.h + 4, b.h] } : { height: b.h }}
          transition={active ? { duration: 1.1, repeat: Infinity, delay: b.d, ease: 'easeInOut' } : { duration: 0.2 }}
        />
      ))}
    </span>
  );
}
