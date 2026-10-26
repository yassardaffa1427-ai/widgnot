import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useData } from '@/store/data';
import { WEEKDAYS_LABEL, WEEKDAYS_SHORT, addMonths, fmtMonth, fromKey, isWeekend, monthMatrix, startOfMonth, toKey, weekOf, weekdayIndex } from '@/lib/date';
import { ActivityRow } from '../ui/ActivityRow';
import { AddActivityForm } from '../ui/AddActivityForm';
import { Chevron, PenSquare } from '../ui/Icons';
import { contentSpring } from '@/lib/motion';

export function CalendarWidget() {
  const { activities, addActivity, toggleActivity, removeActivity } = useData();
  const today = toKey(new Date());
  const [selected, setSelected] = useState(today);
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [adding, setAdding] = useState(false);

  const rows = useMemo(() => monthMatrix(cursor), [cursor]);
  const hasAct = useMemo(() => new Set(activities.map((a) => a.date)), [activities]);
  const day = activities.filter((a) => a.date === selected).sort((a, b) => a.time.localeCompare(b.time));
  const sel = fromKey(selected);

  const pick = (d: Date) => { setSelected(toKey(d)); if (d.getMonth() !== cursor.getMonth()) setCursor(startOfMonth(d)); };

  return (
    <section className="widget">
      <div className="w-head" style={{ paddingBottom: 12 }}><div className="w-title">Calendar 🗓️</div></div>

      <div className="week">
        {weekOf(sel).map((d) => {
          const k = toKey(d);
          return (
            <button
              key={k} onClick={() => pick(d)} aria-label={d.toDateString()}
              className={`week__day ${isWeekend(d) ? 'week__day--wk' : ''} ${k === today ? 'week__day--today' : ''} ${k === selected ? 'week__day--sel' : ''}`}
            >
              <span>{WEEKDAYS_SHORT[weekdayIndex(d)]}</span><b>{d.getDate()}</b>
            </button>
          );
        })}
      </div>

      <div className="cal">
        <div className="cal__head">
          <span>{fmtMonth(cursor)}</span>
          <span className="cal__nav">
            <button className="icon-btn" onClick={() => setCursor(addMonths(cursor, -1))} aria-label="Bulan sebelumnya"><Chevron size={22} dir="left" /></button>
            <button className="icon-btn" onClick={() => setCursor(addMonths(cursor, 1))} aria-label="Bulan berikutnya"><Chevron size={22} dir="right" /></button>
          </span>
        </div>
        <div className="cal__dow">{WEEKDAYS_LABEL.map((w) => <span key={w}>{w}</span>)}</div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={cursor.toISOString()} className="cal__grid" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.18 }}>
            {rows.flat().map((d, i) => {
              if (!d) return <span key={i} />;
              const k = toKey(d);
              const cls = k === selected && k !== today ? 'cal__cell--sel' : k === today ? 'cal__cell--today' : hasAct.has(k) ? 'cal__cell--has' : '';
              return <button key={k} className={`cal__cell ${cls}`} onClick={() => pick(d)}>{d.getDate()}</button>;
            })}
          </motion.div>
        </AnimatePresence>

        {/* Time footer row matching Figma 5:2938 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 10,
            paddingBottom: 4,
            paddingLeft: 6,
            paddingRight: 6,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            marginTop: 6,
          }}
        >
          <span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>Time</span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#ffffff',
              backgroundColor: '#323235',
              padding: '5px 12px',
              borderRadius: 20,
              letterSpacing: '0.02em',
            }}
          >
            09:41 AM
          </span>
        </div>
      </div>

      <div className="w-head" style={{ paddingTop: 18 }}>
        <button className="w-title" onClick={() => setAdding((v) => !v)}>add activities 🏃🏻‍♂️ <PenSquare /></button>
      </div>
      <AnimatePresence initial={false}>
        {adding && (
          <AddActivityForm
            key="form"
            initialDate={selected}
            onCancel={() => setAdding(false)}
            onSubmit={({ title, date, time, notes }) => {
              addActivity({ title, time, date, notes });
              setAdding(false);
            }}
          />
        )}
      </AnimatePresence>
      <motion.div layout transition={contentSpring} className="list">
        <AnimatePresence initial={false}>
          {day.map((a) => <ActivityRow key={a.id} a={a} onToggle={() => toggleActivity(a.id)} onRemove={() => removeActivity(a.id)} />)}
        </AnimatePresence>
        {day.length === 0 && !adding && <p className="empty">Tidak ada aktivitas di tanggal ini.</p>}
      </motion.div>
    </section>
  );
}
