import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAI } from '@/store/ai';
import { useUI } from '@/store/ui';
import { contentSpring } from '@/lib/motion';
import { AIMascotAvatar } from '@/components/ui/AIMascotAvatar';

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

  const [input, setInput] = useState('');
  const [showKeyPanel, setShowKeyPanel] = useState(!apiKey);
  const [keyDraft, setKeyDraft] = useState(apiKey);
  const chatRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isGenerating]);

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

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const val = input.trim();
    if (!val || isGenerating) return;
    setInput('');
    void sendMessage(val);
  };

  return (
    <section
      className="widget"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '20px',
        flex: 1,
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
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
            animate={{ opacity: 1, height: 'auto', marginBottom: 2 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={contentSpring}
            style={{ overflow: 'hidden' }}
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
        }}>
          {error}
        </div>
      )}

      {/* ── Chat bubbles — Figma 147:2362 ── */}
      <div
        ref={chatRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          minHeight: 120,
          paddingRight: 2,
          userSelect: 'text',
          WebkitUserSelect: 'text',
        }}
      >
        {messages.map(m => {
          const isUser = m.role === 'user';
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
                  maxWidth: '88%',
                  padding: '8px 12px',
                  // Figma 147:2388: borderRadius 16px 16px 16px 4px (asisten), 16px 16px 4px 16px (user)
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isUser ? 'var(--system-blue)' : 'rgba(255,255,255,0.10)',
                  border: isUser ? 'none' : '1px solid rgba(255,255,255,0.09)',
                  color: '#fff',
                  fontSize: 13,
                  lineHeight: 1.45,
                  wordBreak: 'break-word',
                  boxShadow: isUser ? '0 2px 8px rgba(10,132,255,0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                  cursor: 'text',
                }}
              >
                <span
                  style={{
                    whiteSpace: 'pre-wrap',
                    userSelect: 'text',
                    WebkitUserSelect: 'text',
                  }}
                >
                  {m.content}
                </span>
                {m.isStreaming && <StreamDot />}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Input Bar — Figma 147:2392 ── */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 16,
          padding: '4px 6px 4px 12px',
          marginTop: 'auto',
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Tanya AI atau ketik sesuatu…"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: input ? 'var(--label)' : '#757575',
            fontSize: 13,
            padding: '6px 0',
          }}
        />
        {/* Send button 32×32 borderRadius 10px — Figma 147:2400 */}
        <button
          type="submit"
          disabled={!input.trim() || isGenerating}
          aria-label="Kirim pesan"
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            border: 'none',
            background: input.trim() && !isGenerating ? 'var(--system-blue)' : 'transparent',
            color: input.trim() && !isGenerating ? '#fff' : 'var(--quaternary-label)',
            cursor: input.trim() && !isGenerating ? 'pointer' : 'default',
            display: 'grid',
            placeItems: 'center',
            transition: 'background 0.15s ease, transform 0.1s ease',
            flexShrink: 0,
          }}
          onPointerDown={e => { if (input.trim()) e.currentTarget.style.transform = 'scale(0.92)'; }}
          onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <SendIcon />
        </button>
      </form>
    </section>
  );
}
