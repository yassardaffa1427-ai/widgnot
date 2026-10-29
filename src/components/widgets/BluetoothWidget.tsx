import { motion } from 'motion/react';
import { useMusic } from '@/store/music';
import { AirPods } from '../ui/Icons';
import { contentSpring } from '@/lib/motion';

/**
 * Figma Node 102:2169: Bluetooth Earphone Info (Page 2)
 * Menampilkan status earphone/AirPods terhubung dan persentase baterai R / L.
 */
export function BluetoothWidget() {
  const m = useMusic();

  const isConnected = m.btConnected;
  const deviceName = isConnected ? (m.btName || 'AirPods Pro') : '[your name bluetooth]';

  // Battery levels (dari status Bluetooth atau default 100% saat connected)
  const fallbackBattery = m.btBattery != null ? `${m.btBattery}%` : '100%';
  const battR = isConnected ? (m.btBatteryR != null ? `${m.btBatteryR}%` : fallbackBattery) : '--%';
  const battL = isConnected ? (m.btBatteryL != null ? `${m.btBatteryL}%` : fallbackBattery) : '--%';

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
        {/* Glowing Circle with Earbuds Icon (Figma 102:2173) */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={m.toggleBluetooth}
          title={isConnected ? `Terhubung ke ${deviceName}` : 'Klik untuk hubungkan Bluetooth'}
          style={{
            position: 'relative',
            width: 84,
            height: 84,
            borderRadius: '50%',
            flexShrink: 0,
            background: '#161618',
            border: isConnected ? '4px solid #00c6ff' : '4px solid rgba(255, 255, 255, 0.15)',
            boxShadow: isConnected
              ? '0 0 28px rgba(0, 198, 255, 0.55), inset 0 0 16px rgba(0, 198, 255, 0.25)'
              : 'none',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            transition: 'border 0.3s, box-shadow 0.3s',
          }}
          transition={contentSpring}
        >
          <AirPods size={34} style={{ color: isConnected ? '#ffffff' : 'rgba(255, 255, 255, 0.35)' }} />
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
              <span style={{ fontSize: 26, fontWeight: 700, opacity: 0.9 }}>R: </span>
              {battR}
            </span>
            <span>
              <span style={{ fontSize: 26, fontWeight: 700, opacity: 0.9 }}>L: </span>
              {battL}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

