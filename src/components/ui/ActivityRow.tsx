import { motion } from 'motion/react';
import type { Activity } from '@/store/data';
import { fmtClock } from '@/lib/date';
import { CheckCircle, Circle } from './Icons';
import { Trash } from './Icons';
import { contentSpring } from '@/lib/motion';

interface Props { a: Activity; onToggle: () => void; onRemove: () => void }

export function ActivityRow({ a, onToggle, onRemove }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={contentSpring}
      className={`row ${a.done ? 'row--done' : ''}`}
    >
      <button className="row__main" onClick={onToggle} aria-label={`${a.done ? 'Batalkan' : 'Selesaikan'}: ${a.title}`} style={{ flex: 1, textAlign: 'left' }}>
        {a.done ? <CheckCircle /> : <Circle />}
        <span className="row__title">{a.title}</span>
      </button>
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <span className="row__time">{fmtClock(a.time)}</span>
        <button className="row__del" onClick={onRemove} aria-label="Hapus"><Trash size={16} /></button>
      </span>
    </motion.div>
  );
}
