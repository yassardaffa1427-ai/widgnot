import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useData } from '@/store/data';
import { useUI } from '@/store/ui';
import { Maximize, Minimize, PenSquare, Trash } from '../ui/Icons';
import { contentSpring } from '@/lib/motion';

const titleOf = (body: string) => body.split('\n')[0].trim() || 'Untitled';
const restOf = (body: string) => body.split('\n').slice(1).join(' ').trim() || 'No additional text';

export function NoteWidget() {
  const { notes, addNote, updateNote, removeNote } = useData();
  const { wide, setWide } = useUI();
  const [activeId, setActiveId] = useState<string | null>(() => (notes.length > 0 ? notes[0].id : null));
  const file = useRef<HTMLInputElement>(null);
  const active = notes.find((n) => n.id === activeId);

  const close = () => {
    if (active && !active.body.trim()) removeNote(active.id);
    setActiveId(null);
    setWide(false);
  };

  const importTxt = async (f: File) => {
    const id = addNote(await f.text());
    setActiveId(id);
  };

  const exportTxt = () => {
    if (!active) return;
    const blob = new Blob([active.body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${titleOf(active.body).replace(/[^a-zA-Z0-9_-]/g, '_') || 'catatan'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordsCount = active?.body.trim() ? active.body.trim().split(/\s+/).length : 0;

  return (
    <section className="widget">
      <input ref={file} type="file" accept=".txt,text/plain" hidden onChange={(e) => e.target.files?.[0] && void importTxt(e.target.files[0])} />
      <AnimatePresence mode="wait" initial={false}>
        {active ? (
          <motion.div key="editor" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={contentSpring}>
            <div className="w-head">
              <button className="w-title" onClick={close} aria-label="Kembali ke daftar catatan">
                {titleOf(active.body)}
              </button>
              <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button
                  className="icon-btn"
                  onClick={() => setWide(!wide)}
                  aria-label={wide ? 'Perkecil' : 'Perbesar'}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.1)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {wide ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </span>
            </div>

            <textarea
              className="editor"
              autoFocus
              placeholder="Tulis sesuatu…"
              value={active.body}
              onChange={(e) => updateNote(active.id, e.target.value)}
              style={{
                height: wide ? 280 : 180,
                color: 'rgba(255, 255, 255, 0.88)',
                lineHeight: 1.6,
              }}
            />

            {/* Bottom Footer bar matching Figma 5:2935 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 14,
                paddingBottom: 4,
              }}
            >
              <span style={{ fontSize: 13, color: '#999999', fontWeight: 500 }}>
                {wordsCount} words
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button
                  className="icon-btn"
                  onClick={() => {
                    removeNote(active.id);
                    close();
                  }}
                  aria-label="Hapus catatan"
                  style={{ color: '#fe2d28', transition: 'transform 0.2s' }}
                >
                  <Trash size={20} />
                </button>

                <button
                  className="chip"
                  onClick={exportTxt}
                  aria-label="Ekspor catatan ke file txt"
                  style={{
                    backgroundColor: '#3d3d3d',
                    borderRadius: 10,
                    padding: '6px 12px',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  export txt
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={contentSpring}>
            <div className="w-head">
              <button className="w-title" onClick={() => setActiveId(addNote())}>
                add note <PenSquare />
              </button>
              <button className="chip" onClick={() => file.current?.click()}>
                input txt file
              </button>
            </div>
            {notes.length === 0 ? (
              <p className="empty" style={{ minHeight: 56 }}>
                Belum ada catatan.
              </p>
            ) : (
              <div className="list" style={{ paddingBottom: 6 }}>
                <AnimatePresence initial={false}>
                  {notes.slice(0, 4).map((n) => (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={contentSpring}
                      className="note-item"
                    >
                      <button className="note-item__body" onClick={() => setActiveId(n.id)}>
                        <b>{titleOf(n.body)}</b>
                        <small>{restOf(n.body).slice(0, 60)}</small>
                      </button>
                      <button className="icon-btn" style={{ color: '#fe2d28' }} onClick={() => removeNote(n.id)} aria-label="Hapus">
                        <Trash size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
