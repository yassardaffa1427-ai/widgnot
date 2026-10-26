import { useEffect, useState, type RefObject } from 'react';

export function useNow(intervalMs = 10_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function useViewport() {
  const read = () => ({ w: window.innerWidth, h: window.innerHeight });
  const [vp, setVp] = useState(read);
  useEffect(() => {
    const on = () => setVp(read());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return vp;
}

/** Tinggi elemen secara live (ResizeObserver). `active` = elemen sedang ter-mount. */
export function useElementHeight(ref: RefObject<HTMLElement>, active: boolean) {
  const [h, setH] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    setH(el.offsetHeight);
    return () => ro.disconnect();
  }, [ref, active]);
  return h;
}
