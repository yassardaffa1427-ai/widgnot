import { useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { coverFor, useMusic } from '@/store/music';
import { fmtMMSS } from '@/lib/date';
import { AirPods, Bluetooth, Pause, Play, Skip } from '../ui/Icons';
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
            <div className="music__top">
              {/* Gray placeholder cover from Figma 5:2933 */}
              <div
                style={{
                  width: 86,
                  height: 86,
                  borderRadius: 20,
                  backgroundColor: '#d9d9d9',
                  flex: 'none',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                }}
              />

              <div className="music__meta">
                <b style={{ fontSize: 18, fontWeight: 600, color: '#ffffff' }}>Name Song</b>
                <span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }}>name producer</span>
              </div>

              {/* Bluetooth / Earbuds Button (inactive dark state in Figma 5:2933 / 26:3261) */}
              <button
                className="icon-btn"
                onClick={m.toggleDevice}
                aria-label={`Earbuds: ${m.btName}`}
                title="Bluetooth Earbuds"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '100px',
                  backgroundColor: '#222222',
                  color: '#ffffff',
                  flex: 'none',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <AirPods size={24} />
              </button>
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
            <div className="music__top">
              <motion.div
                className="music__cover"
                style={{
                  background: coverFor(track),
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                animate={{ scale: m.playing ? 1 : 0.95 }}
                transition={contentSpring}
              >
                {/* Visual subtle gloss shine */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%)',
                    pointerEvents: 'none',
                  }}
                />
              </motion.div>

              <div className="music__meta">
                <b>{track.name}</b>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {track.artist}
                  {track.source === 'spotify' && (
                    <span style={{ fontSize: 10, background: '#1db954', color: '#000', fontWeight: 700, padding: '1px 5px', borderRadius: 4 }}>
                      SPOTIFY
                    </span>
                  )}
                  {track.source === 'youtube' && (
                    <span style={{ fontSize: 10, background: '#ff3333', color: '#fff', fontWeight: 700, padding: '1px 5px', borderRadius: 4 }}>
                      YOUTUBE
                    </span>
                  )}
                </span>
              </div>

              {/* AirPods / Output Device Button (Active Blue) */}
              <button
                className="icon-btn"
                onClick={m.toggleDevice}
                aria-label={`Output: ${m.btName}`}
                title={`Output: ${m.btName}`}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: m.deviceType === 'airpods' ? '#0088ff' : '#333336',
                  color: '#ffffff',
                  boxShadow: m.deviceType === 'airpods' ? '0 0 14px rgba(0, 136, 255, 0.5)' : 'none',
                  flex: 'none',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <AirPods size={24} />
              </button>
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

            <div className="music__ctrl" style={{ gap: 22, marginTop: -4 }}>
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

              <button
                className="chip"
                onClick={m.disconnectMedia}
                title="Hentikan / Kosongkan media"
                style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, color: '#aaa' }}
              >
                ✕ Off
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
