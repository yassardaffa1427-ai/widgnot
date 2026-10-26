import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useData } from '@/store/data';
import { useUI } from '@/store/ui';
import { toKey } from '@/lib/date';
import { ActivityRow } from '../ui/ActivityRow';
import { AddActivityForm } from '../ui/AddActivityForm';
import { Chevron, PenSquare } from '../ui/Icons';
import { contentSpring } from '@/lib/motion';

export function TodoWidget() {
  const { activities, addActivity, toggleActivity, removeActivity } = useData();
  const { addingAct, setAddingAct } = useUI();
  const today = toKey(new Date());
  const [showPast, setShowPast] = useState(false);

  const rawTodays = activities.filter((a) => a.date === today).sort((a, b) => a.time.localeCompare(b.time));
  const rawPast = activities.filter((a) => a.date < today && !a.done);

  const todays = rawTodays;
  const past = rawPast;
  const doneCount = todays.filter((a) => a.done).length;

  return (
    <section className="widget" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="w-head" style={{ padding: '4px 0 6px' }}>
        <button
          className="w-title"
          onClick={() => setAddingAct(!addingAct)}
          aria-label="Tambah aktivitas"
        >
          add activities 🏃🏻‍♂️ <PenSquare />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {addingAct && (
          <AddActivityForm
            key="form"
            initialDate={today}
            initialTime="16:00"
            onCancel={() => setAddingAct(false)}
            onSubmit={({ title, date, time, notes }) => {
              addActivity({ title, time, date, notes });
              setAddingAct(false);
            }}
          />
        )}
      </AnimatePresence>

      <div className="todo__head" style={{ paddingBottom: 8 }}>
        <span className="todo__gutter">{new Date().getDate()}</span>
        <strong>Today</strong>
        <em>
          {doneCount} of {todays.length} tasks
        </em>
      </div>

      <motion.div layout transition={contentSpring} className="list" style={{ paddingBottom: 6 }}>
        {past.length > 0 && (
          <div style={{ paddingLeft: 25 }}>
            <button
              className="todo__past"
              onClick={() => setShowPast((v) => !v)}
              aria-expanded={showPast}
              style={{
                background: '#242424',
                padding: '8px 12px',
                borderRadius: 10,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i
                  className="todo__badge"
                  style={{
                    fontStyle: 'normal',
                    backgroundColor: '#0088ff',
                    width: 20,
                    height: 20,
                    borderRadius: 14,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {past.length}
                </i>
                <span style={{ fontSize: 14, color: '#ffffff' }}>
                  incomplete past task{past.length > 1 ? 's' : ''}
                </span>
              </span>
              <Chevron dir={showPast ? 'up' : 'down'} />
            </button>

            <AnimatePresence initial={false}>
              {showPast && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={contentSpring}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="list" style={{ paddingTop: 8 }}>
                    {past.map((a) => (
                      <ActivityRow
                        key={a.id}
                        a={a}
                        onToggle={() => toggleActivity(a.id)}
                        onRemove={() => removeActivity(a.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {todays.length === 0 ? (
          <p className="empty" style={{ paddingLeft: 25, minHeight: 48 }}>
            Belum ada aktivitas hari ini.
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {todays.map((a) => (
              <div key={a.id} style={{ paddingLeft: 25 }}>
                <ActivityRow
                  a={a}
                  onToggle={() => toggleActivity(a.id)}
                  onRemove={() => removeActivity(a.id)}
                />
              </div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>
    </section>
  );
}
