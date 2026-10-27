import { useEffect, useState } from 'react';
import { Ring } from './Ring';
import { Bolt } from './Icons';

interface BatteryManager extends EventTarget { level: number; charging: boolean }

/** Indikator baterai 29px. Memakai Battery Status API bila ada, kalau tidak tampil 75%. */
export function BatteryRing() {
  const [b, setB] = useState({ level: 0.75, charging: false });

  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManager> };
    let mgr: BatteryManager | undefined;
    const sync = () => mgr && setB({ level: mgr.level, charging: mgr.charging });
    nav.getBattery?.().then((m) => {
      mgr = m; sync();
      m.addEventListener('levelchange', sync);
      m.addEventListener('chargingchange', sync);
    }).catch(() => {});
    return () => { mgr?.removeEventListener('levelchange', sync); mgr?.removeEventListener('chargingchange', sync); };
  }, []);

  const color = b.level <= 0.2 ? '#ff3b30' : '#21ff54';
  return (
    <span style={{ position: 'relative', width: 29, height: 29, display: 'inline-grid', placeItems: 'center' }}>
      <Ring size={29} stroke={4} progress={b.level} color={color} track="rgba(255,255,255,0.12)" />
      {b.charging && (
        <span style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bolt size={13} color="#ffffff" />
        </span>
      )}
    </span>
  );
}
