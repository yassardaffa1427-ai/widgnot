import { motion } from 'motion/react';
import { useMusic } from '@/store/music';
import { AirPods } from '../ui/Icons';
import { contentSpring } from '@/lib/motion';

/**
 * Figma Node 102:2169: Bluetooth Earphone Info (Page 2)
 * Menampilkan status earphone/AirPods terhubung, indikator baterai melingkar presisi,
 * dan persentase baterai L di kiri & R di kanan.
 */
export function BluetoothWidget() {
  const m = useMusic();

  const isConnected = m.btConnected;
  const deviceName = isConnected ? (m.btName || 'AirPods Pro') : '[your name bluetooth]';

  // Battery levels: jika ada nilai dari Windows, tampilkan riil. Default 100% saat connected.
  const fallbackBattery = m.btBattery != null ? `${m.btBattery}%` : '100%';
  const battL = isConnected ? (m.btBatteryL != null ? `${m.btBatteryL}%` : fallbackBattery) : '--%';
  const battR = isConnected ? (m.btBatteryR != null ? `${m.btBatteryR}%` : fallbackBattery) : '--%';

  // Persentase numerik baterai untuk indikator melingkar (0 - 100)
  const numBattery = isConnected
    ? (m.btBattery != null
        ? m.btBattery
        : m.btBatteryL != null && m.btBatteryR != null
        ? Math.round((m.btBatteryL + m.btBatteryR) / 2)
        : m.btBatteryL != null
        ? m.btBatteryL
        : m.btBatteryR != null
        ? m.btBatteryR
        : 100)
    : 0;

  // Perimeter lingkaran r = 37.5 -> C = 2 * PI * 37.5 ≈ 235.62
  const r = 37.5;
  const strokeWidth = 5.5;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - Math.min(100, Math.max(0, numBattery)) / 100);

  return (
    <section className="widget" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 120 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 27,
          padding: '8px 4px',
          width: '100%',
        }}
      >
        {/* Circular Battery Indicator Ring with Earbuds Icon (Figma 102:2173) */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={m.toggleBluetooth}
          title={isConnected ? `Terhubung ke ${deviceName} (Baterai: ${numBattery}%)` : 'Klik untuk hubungkan Bluetooth'}
          style={{
            position: 'relative',
            width: 84,
            height: 84,
            borderRadius: '50%',
            flexShrink: 0,
            background: 'transparent',
            border: 'none',
            padding: 0,
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            filter: isConnected ? 'drop-shadow(0 0 5px rgba(0, 198, 255, 0.45))' : 'none',
            transition: 'filter 0.3s',
          }}
          transition={contentSpring}
        >
          {/* SVG Progress Ring */}
          <svg
            width={84}
            height={84}
            viewBox="0 0 84 84"
            style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
          >
            <defs>
              <linearGradient id="btRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a4fffa" />
                <stop offset="100%" stopColor="#0088ff" />
              </linearGradient>
            </defs>

            {/* Background Track Circle */}
            <circle
              cx={42}
              cy={42}
              r={r}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth}
            />

            {/* Filled Progress Arc based on Battery Percentage */}
            {isConnected && (
              <motion.circle
                cx={42}
                cy={42}
                r={r}
                fill="none"
                stroke="url(#btRingGradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={contentSpring}
              />
            )}
          </svg>

          {/* Inner Disc with AirPods Icon */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              width: 66,
              height: 66,
              borderRadius: '50%',
              backgroundColor: '#161618',
              display: 'grid',
              placeItems: 'center',
              boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)',
            }}
          >
            <AirPods size={32} style={{ color: isConnected ? '#ffffff' : 'rgba(255, 255, 255, 0.35)' }} />
          </div>
        </motion.button>

        {/* Text Details (Figma 102:2179) */}
        <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span
            title={deviceName}
            style={{
              fontSize: 16,
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.45)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
              letterSpacing: '-0.01em',
            }}
          >
            {deviceName}
          </span>

          {/* Battery Status: L di kiri, R di kanan (Sesuai Figma Node 102:2245 & 102:2186) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 18,
              fontSize: 32,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            <span>
              <span style={{ fontSize: 26, fontWeight: 700, opacity: 0.9 }}>L: </span>
              {battL}
            </span>
            <span>
              <span style={{ fontSize: 26, fontWeight: 700, opacity: 0.9 }}>R: </span>
              {battR}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
