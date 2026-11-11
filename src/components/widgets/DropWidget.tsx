import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useDrop, copyDropItemToClipboard, setupImageDragOut, type DropItem } from '@/store/drop';
import { useUI } from '@/store/ui';
import { contentSpring } from '@/lib/motion';
import { TrayArrowDown, DiagonalResize, DiagonalCollapse, Check, Trash } from '../ui/Icons';

export function DropWidget() {
  const { items, selectedId, compact, addItem, removeItem, selectItem, toggleCompact } = useDrop();
  const { open, page, setDropCompact } = useUI();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Sync compact state dengan ui store agar tinggi island menyesuaikan
  useEffect(() => {
    setDropCompact(compact);
  }, [compact, setDropCompact]);

  // Handle Ctrl+V paste secara global saat halaman drop terbuka
  useEffect(() => {
    if (!open || page !== 'drop') return;

    const handlePaste = (e: ClipboardEvent) => {
      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;

      let found = false;
      for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            found = true;
            processFile(file);
          }
        }
      }
      if (found) {
        e.preventDefault();
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [open, page]);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const id = addItem({
          dataUrl,
          name: file.name || `Image ${new Date().toLocaleTimeString()}`,
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeBytes: file.size,
        });

        // Langsung salin ke clipboard untuk kemudahan penggunaan
        void copyDropItemToClipboard(dataUrl).then((ok) => {
          if (ok) {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
          }
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const processImageUrl = (url: string) => {
    if (url.startsWith('data:image/')) {
      const img = new Image();
      img.onload = () => {
        const id = addItem({
          dataUrl: url,
          name: `Image ${new Date().toLocaleTimeString()}`,
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeBytes: Math.round(url.length * 0.75),
        });
        void copyDropItemToClipboard(url).then((ok) => {
          if (ok) {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
          }
        });
      };
      img.src = url;
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 400;
      canvas.height = img.naturalHeight || 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        const id = addItem({
          dataUrl,
          name: `Web Image ${new Date().toLocaleTimeString()}`,
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeBytes: Math.round(dataUrl.length * 0.75),
        });
        void copyDropItemToClipboard(dataUrl).then((ok) => {
          if (ok) {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
          }
        });
      }
    };
    img.src = url;
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach((f) => {
      if (f.type.startsWith('image/')) {
        processFile(f);
      }
    });
    e.target.value = '';
  };

  const handleSelectAndCopy = async (it: DropItem) => {
    selectItem(it.id);
    const success = await copyDropItemToClipboard(it.dataUrl);
    if (success) {
      setCopiedId(it.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // 1. Cek file image lokal dari explorer / desktop
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((f) => {
        if (f.type.startsWith('image/')) {
          processFile(f);
        }
      });
      return;
    }

    // 2. Cek jika image di-drag dari web browser tab
    const html = e.dataTransfer.getData('text/html');
    if (html) {
      const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match && match[1]) {
        processImageUrl(match[1]);
        return;
      }
    }

    const uri = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (uri && (uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('data:image/'))) {
      processImageUrl(uri);
    }
  };

  return (
    <section
      className="widget"
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Drag Over Visual Overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            style={{
              position: 'absolute',
              inset: 8,
              borderRadius: 24,
              backgroundColor: 'rgba(10, 132, 255, 0.28)',
              border: '2px dashed #0a84ff',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              zIndex: 10,
              pointerEvents: 'none',
              boxShadow: '0 0 30px rgba(10, 132, 255, 0.45)',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#0a84ff',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 4px 14px rgba(10, 132, 255, 0.6)',
              }}
            >
              <TrayArrowDown size={30} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
              Lepas gambar di sini
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleFileInput}
      />

      {/* Header Widget */}
      <div
        className="w-head"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2px 0 10px',
        }}
      >
        <div
          className="w-title"
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.02em',
          }}
        >
          Drag once, paste later
        </div>

        <button
          className="icon-btn"
          onClick={toggleCompact}
          aria-label={compact ? 'Mode 3 kolom (Default)' : 'Mode baris (Minimize)'}
          title={compact ? 'Beralih ke mode 3 kolom' : 'Beralih ke mode baris horizontal (Minimize)'}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            color: '#ffffff',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
        >
          {compact ? <DiagonalResize size={15} /> : <DiagonalCollapse size={15} />}
        </button>
      </div>

      {/* Konten Widget: Empty State vs Filled State */}
      <AnimatePresence mode="wait" initial={false}>
        {items.length === 0 ? (
          /* ---------- Empty State ---------- */
          <motion.div
            key="empty-drop"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={contentSpring}
            onClick={() => fileInputRef.current?.click()}
            style={{
              flex: 1,
              minHeight: compact ? 72 : 240,
              border: isDragOver
                ? '2px dashed #0088ff'
                : '1.5px dashed rgba(255, 255, 255, 0.16)',
              borderRadius: compact ? 16 : 20,
              backgroundColor: isDragOver
                ? 'rgba(0, 136, 255, 0.08)'
                : 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              flexDirection: compact ? 'row' : 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              gap: compact ? 10 : 12,
              transition: 'border-color 0.2s, background-color 0.2s',
              userSelect: 'none',
              padding: compact ? '12px 16px' : '24px 16px',
            }}
          >
            <div
              style={{
                width: compact ? 36 : 48,
                height: compact ? 36 : 48,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                display: 'grid',
                placeItems: 'center',
                color: isDragOver ? '#0088ff' : 'rgba(255, 255, 255, 0.7)',
                transition: 'color 0.2s',
                flexShrink: 0,
              }}
            >
              <TrayArrowDown size={compact ? 20 : 28} />
            </div>

            <div
              style={{
                fontSize: compact ? 12 : 13,
                fontWeight: 400,
                color: isDragOver ? '#0088ff' : 'rgba(255, 255, 255, 0.45)',
                textAlign: 'center',
                transition: 'color 0.2s',
              }}
            >
              Drop / paste image here (ctrl + v)
            </div>
          </motion.div>
        ) : compact ? (
          /* ---------- Mode Minimize: Horizontal Scrolling Row (Figma Node 57:2600) ---------- */
          <motion.div
            key="compact-drop"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={contentSpring}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              flex: 1,
              minHeight: 0,
            }}
          >
            <div
              onWheel={(e) => {
                if (e.deltaY) e.currentTarget.scrollLeft += e.deltaY;
              }}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                overflowX: 'auto',
                overflowY: 'hidden',
                scrollbarWidth: 'none',
                flexWrap: 'nowrap',
                padding: '2px 0 6px',
              }}
            >
              {items.map((it) => {
                const isSelected = selectedId === it.id;
                const isCopied = copiedId === it.id;

                return (
                  <motion.div
                    key={it.id}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSelectAndCopy(it)}
                    style={{
                      position: 'relative',
                      width: 72,
                      height: 72,
                      flexShrink: 0,
                      aspectRatio: '1 / 1',
                      borderRadius: 16,
                      overflow: 'hidden',
                      backgroundColor: '#2a2a2e',
                      boxShadow: isSelected
                        ? '0 0 0 2.5px #0088ff, 0 6px 20px rgba(0, 136, 255, 0.35)'
                        : '0 4px 14px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08)',
                      cursor: 'grab',
                      transition: 'box-shadow 0.2s',
                    }}
                  >
                    <div
                      draggable
                      onDragStart={(e: React.DragEvent) => {
                        setupImageDragOut(e, it);
                      }}
                      title="Klik untuk copy, atau drag keluar ke aplikasi lain"
                      style={{ width: '100%', height: '100%' }}
                    >
                      <img
                        src={it.dataUrl}
                        alt={it.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          borderRadius: 16,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        }}
                        draggable={false}
                      />
                    </div>

                    {/* Copied Feedback Badge */}
                    <AnimatePresence>
                      {isCopied && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0, 136, 255, 0.9)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            gap: 2,
                            borderRadius: 16,
                            zIndex: 2,
                          }}
                        >
                          <Check size={18} />
                          <span style={{ fontSize: 10, fontWeight: 700 }}>Copied!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Selected Active Indicator */}
                    {isSelected && !isCopied && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 5,
                          left: 5,
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          backgroundColor: '#0088ff',
                          boxShadow: '0 0 6px #0088ff',
                          zIndex: 2,
                        }}
                      />
                    )}

                    {/* Delete button */}
                    <button
                      className="icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(it.id);
                      }}
                      aria-label="Hapus gambar"
                      title="Hapus"
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        display: 'grid',
                        placeItems: 'center',
                        zIndex: 3,
                        opacity: 0.8,
                      }}
                    >
                      <Trash size={10} />
                    </button>
                  </motion.div>
                );
              })}

              {/* Add more button tile in horizontal row */}
              <button
                onClick={() => fileInputRef.current?.click()}
                aria-label="Tambah gambar lagi"
                title="Tambah gambar (atau Ctrl+V)"
                style={{
                  width: 72,
                  height: 72,
                  flexShrink: 0,
                  aspectRatio: '1 / 1',
                  borderRadius: 16,
                  border: '1.5px dashed rgba(255, 255, 255, 0.16)',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  gap: 2,
                  fontSize: 10,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0088ff';
                  e.currentTarget.style.color = '#0088ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                }}
              >
                <span style={{ fontSize: 20, fontWeight: 300, lineHeight: 1 }}>+</span>
                <span>Add</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* ---------- Mode Default: 3 Kolom Grid ke Bawah (Figma Node 57:2503) ---------- */
          <motion.div
            key="grid-drop"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={contentSpring}
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0,
            }}
          >
            {/* Grid 3 Baris / Kolom ke Samping, Scroll Vertikal ke Bawah */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                overflowY: 'auto',
                maxHeight: 270,
                padding: '2px 0 8px',
                scrollbarWidth: 'none',
              }}
            >
              {items.map((it) => {
                const isSelected = selectedId === it.id;
                const isCopied = copiedId === it.id;

                return (
                  <motion.div
                    key={it.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSelectAndCopy(it)}
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '1 / 1',
                      borderRadius: 20,
                      overflow: 'hidden',
                      backgroundColor: '#2a2a2e',
                      boxShadow: isSelected
                        ? '0 0 0 2.5px #0088ff, 0 6px 20px rgba(0, 136, 255, 0.35)'
                        : '0 4px 14px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08)',
                      cursor: 'grab',
                      transition: 'box-shadow 0.2s',
                    }}
                  >
                    <div
                      draggable
                      onDragStart={(e: React.DragEvent) => {
                        setupImageDragOut(e, it);
                      }}
                      title="Klik untuk copy, atau drag keluar ke aplikasi lain"
                      style={{ width: '100%', height: '100%' }}
                    >
                      <img
                        src={it.dataUrl}
                        alt={it.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          borderRadius: 20,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        }}
                        draggable={false}
                      />
                    </div>

                    {/* Copied Feedback Badge */}
                    <AnimatePresence>
                      {isCopied && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0, 136, 255, 0.88)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            gap: 4,
                            borderRadius: 20,
                            zIndex: 2,
                          }}
                        >
                          <Check size={22} />
                          <span style={{ fontSize: 11, fontWeight: 700 }}>Copied!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Selected Active Indicator */}
                    {isSelected && !isCopied && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#0088ff',
                          boxShadow: '0 0 8px #0088ff',
                          zIndex: 2,
                        }}
                      />
                    )}

                    {/* Delete button */}
                    <button
                      className="icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(it.id);
                      }}
                      aria-label="Hapus gambar"
                      title="Hapus"
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        display: 'grid',
                        placeItems: 'center',
                        zIndex: 3,
                        opacity: 0.8,
                      }}
                    >
                      <Trash size={12} />
                    </button>
                  </motion.div>
                );
              })}

              {/* Add more button tile in grid */}
              <button
                onClick={() => fileInputRef.current?.click()}
                aria-label="Tambah gambar lagi"
                title="Tambah gambar (atau Ctrl+V)"
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  borderRadius: 20,
                  border: '1.5px dashed rgba(255, 255, 255, 0.16)',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  gap: 4,
                  fontSize: 11,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0088ff';
                  e.currentTarget.style.color = '#0088ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                }}
              >
                <span style={{ fontSize: 26, fontWeight: 300, lineHeight: 1 }}>+</span>
                <span>Add / Paste</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
