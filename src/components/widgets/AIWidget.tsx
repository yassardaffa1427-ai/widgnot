import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAI } from '@/store/ai';
import { useUI } from '@/store/ui';
import { useMeeting } from '@/store/meeting';
import { contentSpring } from '@/lib/motion';
import { AIMascotAvatar } from '@/components/ui/AIMascotAvatar';
import { MoreDotsIcon, FileUploadIcon, RecordMeetingIcon } from '@/components/ui/MeetingIcons';

/* ─── Streaming Dot ─────────────────────────────────────────────────────────── */
function StreamDot() {
  return (
    <motion.span
      animate={{ opacity: [1, 0.3, 1] }}
      transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        display: 'inline-block',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: '#0a84ff',
        boxShadow: '0 0 6px #0a84ff',
        verticalAlign: 'middle',
        marginLeft: 4,
      }}
    />
  );
}

/* ─── Image Icon (Google Lens / Attach) ─────────────────────────────────── */
function ImageIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
      <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Send Icon ─────────────────────────────────────────────────────────────── */
function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M14 1L6.5 8.5M14 1L9.5 14L6.5 8.5M14 1L1 5.5L6.5 8.5"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── Exact Figma Node 147:2378 Action Icons ─── */
function KeyIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22 8.29344C22 11.7692 19.1708 14.5869 15.6807 14.5869C15.0439 14.5869 13.5939 14.4405 12.8885 13.8551L12.0067 14.7333C11.4883 15.2496 11.6283 15.4016 11.8589 15.652C11.9551 15.7565 12.0672 15.8781 12.1537 16.0505C12.1537 16.0505 12.8885 17.075 12.1537 18.0995C11.7128 18.6849 10.4783 19.5045 9.06754 18.0995L8.77362 18.3922C8.77362 18.3922 9.65538 19.4167 8.92058 20.4412C8.4797 21.0267 7.30403 21.6121 6.27531 20.5876L5.2466 21.6121C4.54119 22.3146 3.67905 21.9048 3.33616 21.6121L2.45441 20.7339C1.63143 19.9143 2.1115 19.0264 2.45441 18.6849L10.0963 11.0743C10.0963 11.0743 9.3615 9.90338 9.3615 8.29344C9.3615 4.81767 12.1907 2 15.6807 2C19.1708 2 22 4.81767 22 8.29344ZM15.681 10.4889C16.8984 10.4889 17.8853 9.50601 17.8853 8.29353C17.8853 7.08105 16.8984 6.09814 15.681 6.09814C14.4635 6.09814 13.4766 7.08105 13.4766 8.29353C13.4766 9.50601 14.4635 10.4889 15.681 10.4889Z"
        fill="#FFCB22"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

function TrashIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 6.52381C3 6.12932 3.32671 5.80952 3.72973 5.80952H8.51787C8.52437 4.9683 8.61554 3.81504 9.45037 3.01668C10.1074 2.38839 11.0081 2 12 2C12.9919 2 13.8926 2.38839 14.5496 3.01668C15.3844 3.81504 15.4756 4.9683 15.4821 5.80952H20.2703C20.6733 5.80952 21 6.12932 21 6.52381C21 6.9183 20.6733 7.2381 20.2703 7.2381H3.72973C3.32671 7.2381 3 6.9183 3 6.52381Z"
        fill="#FF2121"
      />
      <path
        d="M11.5956 22H12.4044C15.1871 22 16.5785 22 17.4831 21.1141C18.3878 20.2281 18.4803 18.7749 18.6654 15.8685L18.9321 11.6806C19.0326 10.1036 19.0828 9.31512 18.6289 8.81546C18.1751 8.3158 17.4087 8.3158 15.876 8.3158H8.12404C6.59127 8.3158 5.82488 8.3158 5.37105 8.81546C4.91722 9.31512 4.96744 10.1036 5.06788 11.6806L5.33459 15.8685C5.5197 18.7749 5.61225 20.2281 6.51689 21.1141C7.42153 22 8.81289 22 11.5956 22ZM10.2463 12.1885C10.2051 11.7546 9.83753 11.4381 9.42537 11.4815C9.01321 11.5249 8.71251 11.9117 8.75372 12.3456L9.25372 17.6087C9.29494 18.0426 9.66247 18.3591 10.0746 18.3157C10.4868 18.2724 10.7875 17.8855 10.7463 17.4516L10.2463 12.1885ZM14.5746 11.4815C14.9868 11.5249 15.2875 11.9117 15.2463 12.3456L14.7463 17.6087C14.7051 18.0426 14.3375 18.3591 13.9254 18.3157C13.5132 18.2724 13.2125 17.8855 13.2537 17.4516L13.7537 12.1885C13.7949 11.7546 14.1625 11.4381 14.5746 11.4815Z"
        fill="#FF2121"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

function MaximizeIcon({ isWide, size = 18 }: { isWide: boolean; size?: number }) {
  return isWide ? (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#3D3D3D',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6.46967 17.5303C6.17678 17.2374 6.17678 16.7626 6.46967 16.4697L8.68934 14.25H7.5C7.08579 14.25 6.75 13.9142 6.75 13.5C6.75 13.0858 7.08579 12.75 7.5 12.75H10.5C10.9142 12.75 11.25 13.0858 11.25 13.5V16.5C11.25 16.9142 10.9142 17.25 10.5 17.25C10.0858 17.25 9.75 16.9142 9.75 16.5V15.3107L7.53033 17.5303C7.23744 17.8232 6.76256 17.8232 6.46967 17.5303ZM16.5 11.25C16.9142 11.25 17.25 10.9142 17.25 10.5C17.25 10.0858 16.9142 9.75 16.5 9.75H15.3107L17.5303 7.53033C17.8232 7.23744 17.8232 6.76256 17.5303 6.46967C17.2374 6.17678 16.7626 6.17678 16.4697 6.46967L14.25 8.68934V7.5C14.25 7.08579 13.9142 6.75 13.5 6.75C13.0858 6.75 12.75 7.08579 12.75 7.5V10.5C12.75 10.9142 13.0858 11.25 13.5 11.25H16.5Z"
          fill="#FFFFFF"
          fillRule="evenodd"
          clipRule="evenodd"
        />
      </svg>
    </div>
  ) : (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#3D3D3D',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12.5 7C12.5 6.58579 12.8358 6.25 13.25 6.25H17C17.4142 6.25 17.75 6.58579 17.75 7V10.75C17.75 11.1642 17.4142 11.5 17 11.5C16.5858 11.5 16.25 11.1642 16.25 10.75V8.81066L8.81066 16.25H10.75C11.1642 16.25 11.5 16.5858 11.5 17C11.5 17.4142 11.1642 17.75 10.75 17.75H7C6.58579 17.75 6.25 17.4142 6.25 17V13.25C6.25 12.8358 6.58579 12.5 7 12.5C7.41421 12.5 7.75 12.8358 7.75 13.25V15.1893L15.1893 7.75H13.25C12.8358 7.75 12.5 7.41421 12.5 7Z"
          fill="#FFFFFF"
          fillRule="evenodd"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export function AIWidget() {
  const { apiKey, modelLabel, messages, isGenerating, error, setApiKey, setWide, isWide, clearMessages, sendMessage } = useAI();
  const { setWide: setIslandWide } = useUI();
  const {
    isRecording,
    realtimeNotes,
    interimText,
    isMeetingEnded,
    meetingSummary,
    isSummarizing,
    startRecording,
    stopRecording,
    summarizeMeeting,
    exportDocx,
    resetMeeting,
    formatDuration,
  } = useMeeting();

  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showKeyPanel, setShowKeyPanel] = useState(!apiKey);
  const [keyDraft, setKeyDraft] = useState(apiKey);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Click outside to close more menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  // Auto scroll
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isGenerating, attachedImage, realtimeNotes, isRecording, meetingSummary]);

  // Maximize: island menjadi 35% lebih lebar
  const handleMaximize = useCallback(() => {
    const next = !isWide;
    setWide(next);
    setIslandWide(next);
  }, [isWide, setWide, setIslandWide]);

  const handleSaveKey = () => {
    setApiKey(keyDraft);
    if (keyDraft.trim()) setShowKeyPanel(false);
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setAttachedImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const loadExternalImage = (url: string) => {
    if (url.startsWith('data:image/')) {
      setAttachedImage(url);
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
        setAttachedImage(canvas.toDataURL('image/png'));
      }
    };
    img.src = url;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith('image/'));
      if (file) {
        processImageFile(file);
        return;
      }
    }

    const html = e.dataTransfer.getData('text/html');
    if (html) {
      const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match && match[1]) {
        loadExternalImage(match[1]);
        return;
      }
    }

    const uri = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (uri && (uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('data:image/'))) {
      loadExternalImage(uri);
    }
  };

  // Support paste (Ctrl+V) langsung gambar ke AI Chat
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
            e.preventDefault();
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const val = input.trim();
    if ((!val && !attachedImage) || isGenerating) return;
    const imgToSend = attachedImage;
    setInput('');
    setAttachedImage(null);
    void sendMessage(val, imgToSend);
  };

  return (
    <section
      className="widget"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '20px',
        flex: 1,
        height: '100%',
        boxSizing: 'border-box',
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Hidden file input untuk pilih file/gambar/video */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (file.type.startsWith('image/')) {
              processImageFile(file);
            } else {
              setInput(`Tolong bantu saya analisis file: ${file.name}`);
            }
          }
          e.target.value = '';
        }}
      />

      {/* Drag Over Visual Overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            style={{
              position: 'absolute',
              inset: 10,
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
              zIndex: 30,
              pointerEvents: 'none',
              boxShadow: '0 0 32px rgba(10, 132, 255, 0.45)',
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
              <ImageIcon size={26} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
              Lepas gambar untuk bertanya ke AI
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── Header: AI icon + datetime placeholder + close (Figma 147:2340) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 10,
          borderBottom: '1px solid var(--separator)',
          marginBottom: 2,
          gap: 8,
        }}
      >
        {/* Left: Widgnot mascot (pure mascot, no outer rounded box) + title + model label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AIMascotAvatar
            size={38}
            isGenerating={isGenerating}
            hasError={Boolean(error)}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* "AI Chat assistant" font Bold 14px — Figma 147:2373 */}
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--label)', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
              AI Chat assistant
            </div>
            {/* model label font Regular 11px 45% white — Figma 147:2376 */}
            <div
              style={{
                fontSize: 11,
                color: 'var(--tertiary-label)',
                lineHeight: 1.3,
                transition: 'color 0.2s',
              }}
            >
              {isGenerating ? 'Mengetik…' : (apiKey ? modelLabel : 'Masukkan API Key')}
            </div>
          </div>
        </div>

        {/* Right: key / trash / maximize — Figma 147:2378 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            className="icon-btn"
            onClick={() => { setKeyDraft(apiKey); setShowKeyPanel(!showKeyPanel); }}
            aria-label="Pengaturan API Key"
            style={{
              width: 28,
              height: 28,
              padding: 0,
            }}
          >
            <KeyIcon />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={clearMessages}
            aria-label="Bersihkan riwayat chat"
            style={{ width: 28, height: 28, padding: 0 }}
          >
            <TrashIcon />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={handleMaximize}
            aria-label={isWide ? 'Perkecil widget' : 'Perlebar widget 35%'}
            style={{ width: 28, height: 28, padding: 0 }}
          >
            <MaximizeIcon isWide={isWide} />
          </button>
        </div>
      </div>

      {/* ── API Key Panel (animated slide) ── */}
      <AnimatePresence>
        {showKeyPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 6 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={contentSpring}
            style={{ overflow: 'hidden', flexShrink: 0 }}
          >
            <div
              style={{
                background: 'var(--secondary-fill)',
                border: '1px solid var(--separator)',
                borderRadius: 14,
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--secondary-label)', lineHeight: 1.4 }}>
                Masukkan API Key Anda (Gemini, OpenAI, Claude, Qwen):
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="password"
                  placeholder="AIzaSy... / sk-... / AQ...."
                  value={keyDraft}
                  onChange={e => setKeyDraft(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveKey()}
                  style={{
                    flex: 1,
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--separator)',
                    borderRadius: 8,
                    padding: '6px 10px',
                    color: 'var(--label)',
                    fontSize: 12,
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveKey}
                  style={{
                    background: 'var(--system-blue)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Simpan
                </button>
              </div>
              <div style={{ fontSize: 11, color: 'var(--quaternary-label)' }}>
                Tersimpan aman di lokal device.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error banner ── */}
      {error && !showKeyPanel && (
        <div style={{
          fontSize: 11,
          color: 'var(--system-red)',
          background: 'rgba(255,69,58,0.1)',
          border: '1px solid rgba(255,69,58,0.25)',
          borderRadius: 10,
          padding: '6px 10px',
          lineHeight: 1.4,
          flexShrink: 0,
        }}>
          {error}
        </div>
      )}

      {/* ── Chat bubbles — Figma 147:2362 ── */}
      <div
        ref={chatRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          paddingRight: 2,
          userSelect: 'text',
          WebkitUserSelect: 'text',
        }}
      >
        {/* Spacer to push messages down to bottom right above input bar */}
        <div style={{ marginTop: 'auto' }} />

        {messages.map(m => {
          const isUser = m.role === 'user';
          const hasImage = Boolean(m.image);
          // Ukuran max untuk mode minimize (240px) dan maximize (340px) agar gambar tidak over ke kiri
          const bubbleMaxWidth = hasImage ? (isWide ? 340 : 240) : '88%';

          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={contentSpring}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                userSelect: 'text',
                WebkitUserSelect: 'text',
              }}
            >
              <div
                style={{
                  width: hasImage ? '100%' : 'auto',
                  maxWidth: bubbleMaxWidth,
                  padding: hasImage ? 0 : '8px 12px',
                  borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isUser ? 'var(--system-blue)' : 'rgba(255,255,255,0.10)',
                  border: isUser ? 'none' : '1px solid rgba(255,255,255,0.09)',
                  color: '#fff',
                  fontSize: 13,
                  lineHeight: 1.45,
                  wordBreak: 'break-word',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                  overflow: 'hidden',
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                  cursor: 'text',
                }}
              >
                {/* Gambar Lampiran: fill container edge-to-edge tanpa efek blur */}
                {m.image && (
                  <div
                    style={{
                      width: '100%',
                      background: '#1e1e1e',
                      overflow: 'hidden',
                      display: 'block',
                    }}
                  >
                    <img
                      src={m.image}
                      alt="Lampiran"
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: isWide ? 260 : 180,
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>
                )}

                {/* Teks Pesan di Bawah Gambar atau Teks Standar */}
                {m.content && (
                  <div
                    style={{
                      padding: hasImage ? '8px 12px' : 0,
                      whiteSpace: 'pre-wrap',
                      userSelect: 'text',
                      WebkitUserSelect: 'text',
                    }}
                  >
                    <span>{m.content}</span>
                    {m.isStreaming && <StreamDot />}
                  </div>
                )}

                {!m.content && m.isStreaming && (
                  <div style={{ padding: '6px 12px' }}>
                    <StreamDot />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* ── Active Meeting Recording / Realtime Notes Bubble (Figma 207:2418) ── */}
        {(isRecording || isMeetingEnded) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={contentSpring}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              maxWidth: '92%',
              alignSelf: 'flex-start',
            }}
          >
            {/* Main AI Realtime Transcription Card */}
            <div
              style={{
                borderRadius: 18,
                padding: '12px 14px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--label)',
                fontSize: 13,
                lineHeight: 1.5,
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.25)',
              }}
            >
              {/* Header: Ai sedang mengetik secara realtime — Figma 207:2418 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: 8,
                  marginBottom: 8,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13, color: '#FFFFFF' }}>
                  <span>{isRecording ? 'Ai sedang mengetik secara realtime' : 'Notulen Rapat Selesai'}</span>
                  {isRecording && <StreamDot />}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--tertiary-label)',
                    fontVariantNumeric: 'tabular-nums',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    padding: '2px 6px',
                    borderRadius: 6,
                  }}
                >
                  {formatDuration()}
                </span>
              </div>

              {/* Ringkasan Poin Penting (jika sudah diringkas) */}
              {meetingSummary && (
                <div
                  style={{
                    marginBottom: 12,
                    padding: '10px 12px',
                    background: 'rgba(10, 132, 255, 0.12)',
                    border: '1px solid rgba(10, 132, 255, 0.3)',
                    borderRadius: 12,
                    fontSize: 12.5,
                    whiteSpace: 'pre-wrap',
                    color: '#E5E5EA',
                    userSelect: 'text',
                    WebkitUserSelect: 'text',
                  }}
                >
                  {meetingSummary}
                </div>
              )}

              {/* List Poin Realtime */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, userSelect: 'text', WebkitUserSelect: 'text' }}>
                {realtimeNotes.map((note, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ color: '#0a84ff', marginTop: 1, fontSize: 11 }}>•</span>
                    <span style={{ flex: 1, color: '#D1D1D6', fontSize: 12.5 }}>{note}</span>
                  </div>
                ))}
                {interimText && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, opacity: 0.7, fontStyle: 'italic' }}>
                    <span style={{ color: '#0a84ff', marginTop: 1, fontSize: 11 }}>•</span>
                    <span style={{ flex: 1, color: '#8E8E93', fontSize: 12.5 }}>{interimText}...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Post-Meeting Action Buttons: [Ringkaskan poin penting] & [Cetak docx] */}
            {isMeetingEnded && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={contentSpring}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  alignItems: 'center',
                  marginTop: 2,
                }}
              >
                {!meetingSummary && (
                  <button
                    type="button"
                    onClick={() => summarizeMeeting(apiKey, modelLabel)}
                    disabled={isSummarizing}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#0a84ff',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 12,
                      padding: '8px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: isSummarizing ? 'wait' : 'pointer',
                      boxShadow: '0 2px 8px rgba(10, 132, 255, 0.4)',
                      transition: 'transform 0.1s ease',
                    }}
                    onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                    onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <span>✨</span>
                    <span>{isSummarizing ? 'Meringkas...' : 'Ringkaskan poin penting'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => exportDocx()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: 12,
                    padding: '8px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                  onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; }}
                >
                  <FileUploadIcon size={14} color="#FFFFFF" />
                  <span>Cetak docx</span>
                </button>

                <button
                  type="button"
                  onClick={() => resetMeeting()}
                  style={{
                    background: 'transparent',
                    color: 'var(--tertiary-label)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontSize: 11.5,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Selesai
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Lampiran Gambar Pratinjau (Google Lens Mode) ── */}
      <AnimatePresence>
        {attachedImage && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={contentSpring}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 10px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(10, 132, 255, 0.35)',
              borderRadius: 14,
              marginBottom: 4,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
              flexShrink: 0,
            }}
          >
            <img
              src={attachedImage}
              alt="Pratinjau Lampiran"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                objectFit: 'cover',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Mode Analisis Gambar (Google Lens)
              </div>
              <div style={{ fontSize: 10, color: 'var(--tertiary-label)' }}>
                Tanya apa saja tentang gambar ini
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              aria-label="Hapus lampiran gambar"
              title="Hapus gambar"
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                fontSize: 11,
                flexShrink: 0,
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 33, 33, 0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input Bar / Recording Bar — Figma 155:2352 & 207:2418 ── */}
      {isRecording ? (
        /* Figma 207:2418: Bar saat sedang merekam rapat */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={stopRecording}
          title="Klik untuk menghentikan rekaman meeting"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            borderRadius: 16,
            padding: '8px 14px',
            marginTop: 'auto',
            flexShrink: 0,
            cursor: 'pointer',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.09)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Red Pulsing Dot */}
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: '#FF2121',
                boxShadow: '0 0 10px rgba(255, 33, 33, 0.7)',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, color: 'var(--secondary-label)', fontWeight: 500 }}>
              Sedang merekam
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 13,
                color: 'var(--secondary-label)',
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 500,
              }}
            >
              {formatDuration().replace(':', '.')}
            </span>
          </div>
        </motion.div>
      ) : (
        /* Normal Chat Input Bar dengan tombol Titik Tiga (•••) di kiri — Figma 155:2352 / 212:2537 */
        <div style={{ position: 'relative', marginTop: 'auto', flexShrink: 0 }}>
          {/* Popover Menu ke atas */}
          <AnimatePresence>
            {showMoreMenu && (
              <motion.div
                ref={moreMenuRef}
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={contentSpring}
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  left: 0,
                  width: 250,
                  backgroundColor: '#222222',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 16,
                  padding: 6,
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                  zIndex: 40,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {/* Item 1: Tambahkan file / gambar / video */}
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    fileInputRef.current?.click();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '9px 12px',
                    borderRadius: 10,
                    background: 'transparent',
                    border: 'none',
                    color: '#D1D1D6',
                    fontSize: 12.5,
                    fontWeight: 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#D1D1D6';
                  }}
                >
                  <FileUploadIcon size={18} color="#9E9E9E" />
                  <span>Tambahkan file / gambar / video</span>
                </button>

                {/* Divider Pemisah */}
                <div
                  style={{
                    height: 1,
                    background: 'rgba(255, 255, 255, 0.08)',
                    margin: '3px 6px',
                  }}
                />

                {/* Item 2: Record meeting */}
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    void startRecording();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '9px 12px',
                    borderRadius: 10,
                    background: 'transparent',
                    border: 'none',
                    color: '#D1D1D6',
                    fontSize: 12.5,
                    fontWeight: 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#D1D1D6';
                  }}
                >
                  <RecordMeetingIcon size={18} color="#9E9E9E" />
                  <span>Record meeting</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 16,
              padding: '4px 6px 4px 8px',
            }}
          >
            {/* Tombol Titik Tiga (•••) di sisi kiri input — Figma 155:2352 / 212:2537 */}
            <button
              type="button"
              onClick={() => setShowMoreMenu((v) => !v)}
              aria-label="Menu opsi lainnya"
              title="Menu lampiran & rekam meeting"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                border: 'none',
                background: showMoreMenu ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: showMoreMenu ? '#FFFFFF' : 'var(--tertiary-label)',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!showMoreMenu) e.currentTarget.style.color = 'var(--secondary-label)';
              }}
              onMouseLeave={(e) => {
                if (!showMoreMenu) e.currentTarget.style.color = 'var(--tertiary-label)';
              }}
            >
              <MoreDotsIcon size={17} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={attachedImage ? 'Tanya tentang gambar ini…' : 'Tanya AI atau ketik sesuatu…'}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: input ? 'var(--label)' : '#757575',
                fontSize: 13,
                padding: '6px 2px',
              }}
            />

            {/* Send button 32×32 borderRadius 10px — Figma 147:2400 */}
            <button
              type="submit"
              disabled={(!input.trim() && !attachedImage) || isGenerating}
              aria-label="Kirim pesan"
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                border: 'none',
                background: (input.trim() || attachedImage) && !isGenerating ? 'var(--system-blue)' : 'transparent',
                color: (input.trim() || attachedImage) && !isGenerating ? '#fff' : 'var(--quaternary-label)',
                cursor: (input.trim() || attachedImage) && !isGenerating ? 'pointer' : 'default',
                display: 'grid',
                placeItems: 'center',
                transition: 'background 0.15s ease, transform 0.1s ease',
                flexShrink: 0,
              }}
              onPointerDown={(e) => {
                if (input.trim() || attachedImage) e.currentTarget.style.transform = 'scale(0.92)';
              }}
              onPointerUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
