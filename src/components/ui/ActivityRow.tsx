import { motion } from 'motion/react';
import type { Activity } from '@/store/data';
import { fmtClock } from '@/lib/date';
import { CheckCircle, Circle, Trash } from './Icons';
import { contentSpring } from '@/lib/motion';

interface Props { a: Activity; onToggle: () => void; onRemove: () => void }

export function ActivityRow({ a, onToggle, onRemove }: Props) {
  const timeDisplay = a.deadlineTime && a.deadlineTime !== a.time
    ? `${fmtClock(a.time)} - ${fmtClock(a.deadlineTime)}`
    : fmtClock(a.time);

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
        <span
          className="row__time"
          title={a.deadlineTime ? `Mulai: ${fmtClock(a.time)} · Deadline: ${fmtClock(a.deadlineTime)}` : undefined}
          style={{ fontSize: a.deadlineTime && a.deadlineTime !== a.time ? 11 : 12 }}
        >
          {timeDisplay}
        </span>
        <button className="row__del" onClick={onRemove} aria-label="Hapus"><Trash size={16} /></button>
      </span>
    </motion.div>
  );
}
