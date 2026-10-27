import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useDrop, copyDropItemToClipboard, type DropItem } from '@/store/drop';
import { useUI } from '@/store/ui';
import { contentSpring } from '@/lib/motion';
import { TrayArrowDown, DiagonalResize, DiagonalCollapse, Check, Trash } from '../ui/Icons';

export function DropWidget() {
  const { items, selectedId, compact, addItem, removeItem, clearAll, selectItem, toggleCompact } = useDrop();
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((f) => {
        if (f.type.startsWith('image/')) {
          processFile(f);
        }
      });
    }
  };

  return (
    <section
      className="widget"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
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
          padding: '4px 0 12px',
        }}
      >
        <div
          className="w-title"
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.02em',
          }}
        >
          Drag once, paste later
        </div>

        {items.length > 0 && (
          <button
            className="icon-btn"
            onClick={toggleCompact}
            aria-label={compact ? 'Perbesar panel' : 'Perkecil panel'}
            title={compact ? 'Perbesar panel' : 'Perkecil panel'}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {compact ? <DiagonalResize size={16} /> : <DiagonalCollapse size={16} />}
          </button>
        )}
      </div>

      {/* Konten Widget: Empty State vs Filled State */}
      <AnimatePresence mode="wait" initial={false}>
        {items.length === 0 ? (
          /* ---------- Empty State: Dashed drop zone box (Figma Node 416x359) ---------- */
          <motion.div
            key="empty-drop"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={contentSpring}
            onClick={() => fileInputRef.current?.click()}
            style={{
              flex: 1,
              minHeight: 195,
              border: isDragOver
                ? '2px dashed #0088ff'
                : '1.5px dashed rgba(255, 255, 255, 0.16)',
              borderRadius: 16,
              backgroundColor: isDragOver
                ? 'rgba(0, 136, 255, 0.08)'
                : 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              gap: 12,
              transition: 'border-color 0.2s, background-color 0.2s',
              userSelect: 'none',
              padding: '24px 16px',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                display: 'grid',
                placeItems: 'center',
                color: isDragOver ? '#0088ff' : 'rgba(255, 255, 255, 0.7)',
                transition: 'color 0.2s',
              }}
            >
              <TrayArrowDown size={28} />
            </div>

            <div
              style={{
                fontSize: 13,
                fontWeight: 400,
                color: isDragOver ? '#0088ff' : 'rgba(255, 255, 255, 0.45)',
                textAlign: 'center',
                transition: 'color 0.2s',
              }}
            >
              Drop / paste image here (ctrl + v)
            </div>
          </motion.div>
        ) : (
          /* ---------- Filled State: Rounded square preview cards (Figma) ---------- */
          <motion.div
            key="filled-drop"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={contentSpring}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              flex: 1,
              minHeight: 0,
            }}
          >
            {/* Grid Thumbnail Gambar */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                overflowY: 'auto',
                maxHeight: compact ? 125 : 205,
                padding: '4px 2px 8px',
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
                      width: 105,
                      height: 105,
                      borderRadius: 18,
                      overflow: 'hidden',
                      backgroundColor: '#2a2a2e',
                      boxShadow: isSelected
                        ? '0 0 0 2.5px #0088ff, 0 6px 20px rgba(0, 136, 255, 0.35)'
                        : '0 4px 14px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'box-shadow 0.2s',
                    }}
                  >
                    <img
                      src={it.dataUrl}
                      alt={it.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: 18,
                      }}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', it.name);
                        e.dataTransfer.setData('text/uri-list', it.dataUrl);
                      }}
                    />

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
                            backgroundColor: 'rgba(0, 136, 255, 0.85)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            gap: 4,
                            borderRadius: 18,
                            zIndex: 2,
                          }}
                        >
                          <Check size={20} />
                          <span style={{ fontSize: 11, fontWeight: 700 }}>Copied!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Selected Active Indicator */}
                    {isSelected && !isCopied && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 6,
                          left: 6,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#0088ff',
                          boxShadow: '0 0 8px #0088ff',
                          zIndex: 2,
                        }}
                      />
                    )}

                    {/* Delete button on top right */}
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
                        top: 5,
                        right: 5,
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

              {/* Add more button tile */}
              <button
                onClick={() => fileInputRef.current?.click()}
                aria-label="Tambah gambar lagi"
                title="Tambah gambar (atau Ctrl+V)"
                style={{
                  width: 105,
                  height: 105,
                  borderRadius: 18,
                  border: '1.5px dashed rgba(255, 255, 255, 0.16)',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  flexShrink: 0,
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
                <span style={{ fontSize: 24, fontWeight: 300, lineHeight: 1 }}>+</span>
                <span>Add / Paste</span>
              </button>
            </div>

            {/* Hint & Actions Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '2px 4px 0',
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.45)',
              }}
            >
              <span>Klik gambar untuk menyalin (Ctrl+V di Figma)</span>
              {items.length > 1 && (
                <button
                  onClick={clearAll}
                  style={{
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ff4d4f'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'; }}
                >
                  Hapus Semua
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
