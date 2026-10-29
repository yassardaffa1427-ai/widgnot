import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useUI, type PageId } from '@/store/ui';
import { useData } from '@/store/data';
import { useMusic } from '@/store/music';
import { useTimer } from '@/store/timer';
import { toKey } from '@/lib/date';

interface Props {
  children?: React.ReactNode;
}

export function DesktopShell({ children }: Props) {
  const { setOpen, goTo, page, open } = useUI();
  const { autoHide, setAutoHide } = useData();
  const { playing } = useMusic();
  const timer = useTimer();

  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      );
      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const openApp = (target: PageId) => {
    goTo(target);
    setOpen(true);
  };

  const dockApps = [
    {
      id: 'music' as PageId,
      name: 'Music',
      color: 'linear-gradient(135deg, #ff2a85 0%, #ff5e62 100%)',
      badge: playing ? '♪' : null,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" fill="#fff" />
          <circle cx="18" cy="16" r="3" fill="#fff" />
        </svg>
      ),
    },
    {
      id: 'bluetooth' as PageId,
      name: 'Earphones',
      color: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
          <path d="M7 7l10 10-5 4V3l5 4L7 17" />
        </svg>
      ),
    },
    {
      id: 'note' as PageId,
      name: 'Notes',
      color: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
          <path d="M12 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-6" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
    },
    {
      id: 'calendar' as PageId,
      name: 'Calendar',
      color: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
      badge: new Date().getDate().toString(),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="4" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      id: 'timer' as PageId,
      name: 'Focus Timer',
      color: 'linear-gradient(135deg, #fe2d28 0%, #ff7844 100%)',
      badge: timer.running ? '●' : null,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2 2" />
          <path d="M9 2h6" />
        </svg>
      ),
    },
    {
      id: 'todo' as PageId,
      name: 'Todo & Activities',
      color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      ),
    },
  ];

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: `
          radial-gradient(1200px 700px at 75% 20%, rgba(0, 136, 255, 0.18), transparent 60%),
          radial-gradient(1000px 600px at 20% 80%, rgba(254, 45, 40, 0.14), transparent 60%),
          radial-gradient(900px 500px at 50% 50%, rgba(120, 40, 255, 0.12), transparent 70%),
          #0b0b0f
        `,
        fontFamily: "var(--font), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ---------- macOS Top Menu Bar (Figma 5:8188) ---------- */}
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          backgroundColor: 'rgba(20, 20, 24, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 30,
          fontSize: 13,
          color: '#ffffff',
          userSelect: 'none',
        }}
      >
        {/* Leading Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 16, cursor: 'default' }}></span>
          <b style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>Widgnot</b>
          <span style={{ color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer' }}>File</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer' }}>Edit</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer' }}>View</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer' }}>Window</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer' }}>Help</span>
        </div>

        {/* Trailing Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Auto-hide toggle badge */}
          <button
            onClick={() => setAutoHide(!autoHide)}
            title="Klik untuk toggle auto-hide pada dock sisi layar"
            style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 6,
              background: autoHide ? 'rgba(0, 136, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
              color: autoHide ? '#60b0ff' : 'rgba(255, 255, 255, 0.6)',
              border: 'none',
            }}
          >
            Auto-hide (10s): {autoHide ? 'ON' : 'OFF'}
          </button>

          {/* Quick deadline demo button */}
          <button
            onClick={() => {
              const d = new Date();
              d.setMinutes(d.getMinutes() + 10);
              const hh = String(d.getHours()).padStart(2, '0');
              const mm = String(d.getMinutes()).padStart(2, '0');
              const timeStr = hh + ':' + mm;
              useData.getState().addActivity({
                title: 'Review Project',
                date: toKey(new Date()),
                time: timeStr,
                deadlineTime: timeStr,
              });
            }}
            title="Klik untuk menambah task deadline 10 menit (tes animasi maskot marah dan bubble chat)"
            style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 6,
              background: 'rgba(255, 51, 75, 0.2)',
              color: '#ff6b81',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            + Tes Deadline
          </button>

          {/* Island Toggle status */}
          <button
            onClick={() => {
              if (!open) goTo('music');
              setOpen(!open);
            }}
            style={{
              fontSize: 12,
              padding: '3px 10px',
              borderRadius: 8,
              background: open ? '#0088ff' : 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontWeight: 600,
            }}
          >
            {open ? 'Island Open' : 'Island Closed'}
          </button>

          {/* Wifi Icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
          </svg>

          {/* Spotlight Search */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          {/* Control Center */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="6" rx="2" />
            <rect x="3" y="14" width="18" height="6" rx="2" />
            <circle cx="8" cy="7" r="1.5" fill="currentColor" />
            <circle cx="16" cy="17" r="1.5" fill="currentColor" />
          </svg>

          {/* Date & Time */}
          <span style={{ fontWeight: 500, letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>
            {dateStr} &nbsp; <b>{timeStr}</b>
          </span>
        </div>
      </header>

      {/* ---------- Main Desktop Background & Wallpaper Context ---------- */}
      <main
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px 90px',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ maxWidth: 520, pointerEvents: 'auto' }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 30,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: 16,
              backdropFilter: 'blur(10px)',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#21ff54', display: 'inline-block' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>Liquid Dynamic Island Active</span>
          </div>

          <h1
            style={{
              fontSize: 48,
              fontWeight: 800,
              margin: '0 0 12px',
              letterSpacing: '-0.03em',
              background: 'linear-gradient(180deg, #ffffff 40%, rgba(255, 255, 255, 0.65) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Widgnot Island
          </h1>

          <p
            style={{
              margin: '0 0 24px',
              color: 'rgba(255, 255, 255, 0.65)',
              fontSize: 15,
              lineHeight: 1.6,
            }}
          >
            Widget sidebar tersembunyi dengan animasi <b>Liquid Spring</b> ala Apple Dynamic Island.
            Tarik pill untuk memindahkan, atau klik ikon di <b>Dock bawah</b> untuk langsung membuka widget.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: 'rgba(255, 255, 255, 0.75)',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              Toggle: <kbd style={{ background: '#333', padding: '2px 6px', borderRadius: 4 }}>Alt</kbd> +{' '}
              <kbd style={{ background: '#333', padding: '2px 6px', borderRadius: 4 }}>W</kbd>
            </span>

            <span
              style={{
                fontSize: 13,
                color: 'rgba(255, 255, 255, 0.75)',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              Tutup: <kbd style={{ background: '#333', padding: '2px 6px', borderRadius: 4 }}>Esc</kbd>
            </span>
          </div>
        </motion.div>
      </main>

      {/* ---------- macOS Bottom Dock (Figma 5:8188) ---------- */}
      <footer
        style={{
          position: 'absolute',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 14px',
          backgroundColor: 'rgba(30, 30, 36, 0.55)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          zIndex: 25,
          userSelect: 'none',
        }}
      >
        {dockApps.map((app) => {
          const isActive = open && page === app.id;
          return (
            <motion.button
              key={app.id}
              onClick={() => openApp(app.id)}
              whileHover={{ scale: 1.2, y: -6 }}
              whileTap={{ scale: 0.95 }}
              title={app.name}
              style={{
                position: 'relative',
                width: 48,
                height: 48,
                borderRadius: 14,
                background: app.color,
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {app.icon}

              {/* Notification badge / state indicator */}
              {app.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    fontSize: 10,
                    fontWeight: 800,
                    display: 'grid',
                    placeItems: 'center',
                    padding: '0 3px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  }}
                >
                  {app.badge}
                </span>
              )}

              {/* Active Dot indicator below icon */}
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: -6,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </footer>

      {/* Widgnot Island Component */}
      {children}
    </div>
  );
}
