import { useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useMusic } from '@/store/music';
import { fmtMMSS } from '@/lib/date';
import { AirPods, Bluetooth, Disc, Pause, Play, Skip } from '../ui/Icons';
import { contentSpring } from '@/lib/motion';

const fade = { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 }, transition: contentSpring };

export function MusicWidget() {
  const m = useMusic();
  const file = useRef<HTMLInputElement>(null);
  const track = m.hasActiveMedia ? m.tracks[m.index] : null;
  const dur = m.duration || 180;
  const ratio = dur > 0 ? m.current / dur : 0;

  const picker = (
    <input ref={file} type="file" accept="audio/*" multiple hidden onChange={(e) => e.target.files && m.addFiles(e.target.files)} />
  );

  return (
    <section className="widget" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {picker}
      <AnimatePresence mode="wait" initial={false}>
        {m.bt === 'pairing' ? (
          <motion.div key="pairing" className="music__center" {...fade}>
            <span className="bt bt--pulse"><Bluetooth /></span>
            <div className="w-title" style={{ fontSize: 20 }}>Pairing…</div>
            <span className="muted" style={{ fontSize: 13 }}>Pilih perangkat di dialog browser</span>
          </motion.div>
        ) : !m.hasActiveMedia || !track ? (
          /* ---------- Figma Node 5:2933: Empty / No Music Here State ---------- */
          <motion.div key="empty-figma" className="music" {...fade}>
            <div className="music__top" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', overflow: 'hidden' }}>
              {/* Gray placeholder cover with disc icon */}
              <div
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 24,
                  backgroundColor: '#383838',
                  flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Disc size={36} color="rgba(255, 255, 255, 0.45)" />
              </div>

              <div className="music__meta" style={{ minWidth: 0, flex: '1 1 0%', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <b style={{ fontSize: 18, fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', width: '100%' }}>Name Song</b>
                <span style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 3, display: 'block', width: '100%' }}>name producer</span>
              </div>

              {/* Bluetooth / Earbuds Button (Figma 5:2933) */}
              <motion.button
                className="icon-btn"
                whileTap={{ scale: 0.92 }}
                onClick={m.toggleBluetooth}
                aria-label={m.btEnabled ? (m.btConnected ? `Bluetooth Terhubung: ${m.btName}` : 'Bluetooth Aktif') : 'Bluetooth Nonaktif (Disable)'}
                title={m.btEnabled ? (m.btConnected ? `Terhubung: ${m.btName}` : 'Bluetooth Aktif') : 'Bluetooth Nonaktif (Klik untuk menyalakan)'}
                style={{
                  marginLeft: 'auto',
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: m.btEnabled ? (m.btConnected ? '#0088ff' : '#28282c') : 'rgba(255, 255, 255, 0.05)',
                  color: m.btEnabled ? '#ffffff' : 'rgba(255, 255, 255, 0.25)',
                  border: m.btEnabled ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: m.btEnabled && m.btConnected ? '0 4px 14px rgba(0, 136, 255, 0.45)' : 'none',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  opacity: m.btEnabled ? 1 : 0.35,
                  transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
              >
                {m.btConnected ? <AirPods size={22} /> : <Bluetooth size={22} />}
              </motion.button>
            </div>

            {/* Empty Track line 00.00 / 00.00 from Figma 5:2933 */}
            <div className="music__bar">
              <div
                style={{
                  height: 3,
                  width: '100%',
                  borderRadius: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  margin: '6px 0',
                }}
              />
              <div className="music__time" style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: 12 }}>
                <span>00.00</span>
                <span>00.00</span>
              </div>
            </div>

            {/* Play controls */}
            <div className="music__ctrl" style={{ gap: 24, marginTop: -4 }}>
              <button className="icon-btn" onClick={m.prev} aria-label="Sebelumnya" style={{ color: 'rgba(255,255,255,0.7)' }}>
                <Skip dir="prev" size={24} />
              </button>
              <button
                className="icon-btn"
                onClick={m.toggle}
                aria-label="Putar musik"
                style={{
                  width: 52,
                  height: 52,
                  background: '#ffffff',
                  color: '#000000',
                  boxShadow: '0 4px 16px rgba(255, 255, 255, 0.25)',
                }}
              >
                <Play size={22} />
              </button>
              <button className="icon-btn" onClick={m.next} aria-label="Berikutnya" style={{ color: 'rgba(255,255,255,0.7)' }}>
                <Skip size={24} />
              </button>
            </div>

            {/* Live detection info badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 4 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  color: 'rgba(255, 255, 255, 0.65)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '4px 12px',
                  borderRadius: 20,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#1db954',
                    boxShadow: '0 0 6px #1db954',
                  }}
                />
                <span>Otomatis sinkron YouTube &amp; Spotify</span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ---------- Active Media Playing State (Figma Node 5:2927) ---------- */
          <motion.div key="player-active" className="music" {...fade}>
            <div className="music__top" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', overflow: 'hidden' }}>
              <motion.div
                className="music__cover"
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 24,
                  flexShrink: 0,
                  background: track.thumbnail ? '#1b1b1b' : '#383838',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'grid',
                  placeItems: 'center',
                }}
                animate={{ scale: m.playing ? 1 : 0.95 }}
                transition={contentSpring}
              >
                {track.thumbnail ? (
                  <img
                    src={track.thumbnail}
                    alt={track.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      placeItems: 'center',
                      width: '100%',
                      height: '100%',
                      background: '#383838',
                    }}
                  >
                    <Disc size={36} color="rgba(255, 255, 255, 0.45)" />
                  </div>
                )}

                {/* Visual subtle gloss shine */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)',
                    pointerEvents: 'none',
                  }}
                />
              </motion.div>

              <div className="music__meta" style={{ minWidth: 0, flex: '1 1 0%', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <b
                  title={track.name}
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#ffffff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                    lineHeight: 1.25,
                    width: '100%',
                  }}
                >
                  {track.name}
                </b>
                <span
                  title={track.artist}
                  style={{
                    display: 'block',
                    fontSize: 13,
                    color: 'rgba(255, 255, 255, 0.7)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginTop: 3,
                    width: '100%',
                  }}
                >
                  {track.artist}
                </span>
              </div>

              {/* Real Windows Bluetooth Earbuds Button (Figma Node 5:2927) - Aligned Right */}
              <motion.button
                className="icon-btn"
                whileTap={{ scale: 0.92 }}
                onClick={m.toggleBluetooth}
                aria-label={m.btEnabled ? (m.btConnected ? `Bluetooth Terhubung: ${m.btName}` : 'Bluetooth Aktif') : 'Bluetooth Nonaktif (Disable)'}
                title={m.btEnabled ? (m.btConnected ? `Terhubung: ${m.btName}` : 'Bluetooth Aktif') : 'Bluetooth Nonaktif (Klik untuk menyalakan)'}
                style={{
                  marginLeft: 'auto',
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: m.btEnabled ? (m.btConnected ? '#0088ff' : '#28282c') : 'rgba(255, 255, 255, 0.05)',
                  color: m.btEnabled ? '#ffffff' : 'rgba(255, 255, 255, 0.25)',
                  border: m.btEnabled ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: m.btEnabled && m.btConnected ? '0 4px 14px rgba(0, 136, 255, 0.45)' : 'none',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  opacity: m.btEnabled ? 1 : 0.35,
                  transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
              >
                {m.btConnected ? <AirPods size={22} /> : <Bluetooth size={22} />}
              </motion.button>
            </div>

            <div className="music__bar">
              <input
                className="range"
                type="range"
                min={0}
                max={1000}
                aria-label="Posisi lagu"
                value={Math.round(ratio * 1000)}
                style={{ ['--p' as string]: `${ratio * 100}%` }}
                onChange={(e) => m.seek(Number(e.target.value) / 1000)}
              />
              <div className="music__time">
                <span>{fmtMMSS(Math.floor(m.current))}</span>
                <span>{fmtMMSS(Math.floor(dur))}</span>
              </div>
            </div>

            <div className="music__ctrl" style={{ gap: 26, marginTop: -4 }}>
              <button className="icon-btn" onClick={m.prev} aria-label="Sebelumnya">
                <Skip dir="prev" size={24} />
              </button>
              <button
                className="icon-btn"
                onClick={m.toggle}
                aria-label={m.playing ? 'Jeda' : 'Putar'}
                style={{
                  width: 52,
                  height: 52,
                  background: '#ffffff',
                  color: '#000000',
                  boxShadow: '0 4px 16px rgba(255, 255, 255, 0.25)',
                }}
              >
                {m.playing ? <Pause size={22} /> : <Play size={22} />}
              </button>
              <button className="icon-btn" onClick={m.next} aria-label="Berikutnya">
                <Skip size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
