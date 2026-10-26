import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useData } from '@/store/data';
import { useUI } from '@/store/ui';
import { Maximize, Minimize, PenSquare, Trash } from '../ui/Icons';
import { contentSpring } from '@/lib/motion';

const titleOf = (body: string) => body.split('\n')[0].trim() || 'Untitled';
const restOf = (body: string) => {
  const lines = body.split('\n').slice(1).join(' ').trim();
  if (lines) return lines;
  const first = body.split('\n')[0].trim();
  return first ? first : 'No additional text';
};

const fmtDDMMYY = (ts?: number) => {
  if (!ts) return 'dd/mm/yy';
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

export function NoteWidget() {
  const { notes, addNote, updateNote, removeNote } = useData();
  const { wide, setWide } = useUI();
  const [activeId, setActiveId] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const active = notes.find((n) => n.id === activeId);

  const close = () => {
    if (active && !active.body.trim()) removeNote(active.id);
    setActiveId(null);
    setWide(false);
  };

  const handleSave = () => {
    close();
  };

  const importTxt = async (f: File) => {
    const text = await f.text();
    const id = addNote(text);
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
          /* ---------- Note Editor (Figma Node 5:2935 & 5:2929) ---------- */
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

            {/* Bottom Footer bar with Save button matching Figma 5:2935 */}
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

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  className="icon-btn"
                  onClick={() => {
                    removeNote(active.id);
                    close();
                  }}
                  aria-label="Hapus catatan"
                  title="Hapus catatan"
                  style={{ color: '#fe2d28', transition: 'transform 0.2s', padding: 4 }}
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

                {/* Save button added matching Figma 5:2935 */}
                <button
                  className="chip"
                  onClick={handleSave}
                  aria-label="Simpan catatan"
                  style={{
                    backgroundColor: '#3d3d3d',
                    color: '#ffffff',
                    borderRadius: 10,
                    padding: '6px 14px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ---------- Notes List & History Cards (Figma Node 38:1155) ---------- */
          <motion.div key="list" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={contentSpring}>
            <div className="w-head" style={{ marginBottom: 12 }}>
              <button className="w-title" onClick={() => setActiveId(addNote())} aria-label="Tambah catatan baru">
                add note <PenSquare />
              </button>
              <button className="chip" onClick={() => file.current?.click()} aria-label="Impor file txt">
                input txt file
              </button>
            </div>

            {notes.length === 0 ? (
              <p className="empty" style={{ minHeight: 64, color: 'rgba(255, 255, 255, 0.5)' }}>
                Belum ada catatan. Klik <b>add note</b> untuk membuat catatan baru.
              </p>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  maxHeight: 260,
                  overflowY: 'auto',
                  paddingRight: 2,
                }}
              >
                <AnimatePresence initial={false}>
                  {notes.map((n) => {
                    const title = titleOf(n.body);
                    const snippet = restOf(n.body);
                    const dateStr = fmtDDMMYY(n.updatedAt);

                    return (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.94 }}
                        transition={contentSpring}
                        style={{
                          backgroundColor: '#252525',
                          border: '1px solid #474747',
                          borderRadius: 10,
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          cursor: 'pointer',
                          transition: 'border-color 0.18s, background 0.18s',
                        }}
                        onClick={() => setActiveId(n.id)}
                      >
                        {/* Card Header matching Figma 38:1193 */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 16,
                              fontWeight: 700,
                              color: '#ffffff',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: 190,
                            }}
                          >
                            {title}
                          </p>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.45)', whiteSpace: 'nowrap' }}>
                              {dateStr}
                            </span>

                            <button
                              className="icon-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveId(n.id);
                              }}
                              aria-label="Buka dan edit catatan"
                              title="Buka / Edit"
                              style={{ color: '#ffffff', padding: 2 }}
                            >
                              <Maximize size={18} />
                            </button>

                            <button
                              className="icon-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNote(n.id);
                              }}
                              aria-label="Hapus catatan"
                              title="Hapus"
                              style={{ color: '#fe2d28', padding: 2 }}
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Card Body snippet matching Figma 38:1196 */}
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            color: 'rgba(255, 255, 255, 0.72)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            lineHeight: 1.4,
                          }}
                        >
                          {snippet}
                        </p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
