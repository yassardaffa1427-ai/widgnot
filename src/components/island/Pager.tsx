import { motion } from 'motion/react';
import { PAGE_ORDER, useUI } from '@/store/ui';
import { ArrowCircle } from '../ui/Icons';
import { contentSpring } from '@/lib/motion';

/** Panah + page dots. Dot aktif memanjang jadi pil 42px (morph dengan spring). */
export function Pager() {
  const { page, go, goTo } = useUI();
  return (
    <div className="pager">
      <button className="icon-btn" onClick={() => go(-1)} aria-label="Halaman sebelumnya"><ArrowCircle dir="left" /></button>
      <div className="pager__dots" role="tablist" aria-label="Widget">
        {PAGE_ORDER.map((p) => (
          <motion.button
            key={p} role="tab" aria-selected={p === page} aria-label={p} className="pager__dot"
            onClick={() => goTo(p)}
            animate={{ width: p === page ? 42 : 5, backgroundColor: p === page ? '#ffffff' : '#585858' }}
            transition={contentSpring}
          />
        ))}
      </div>
      <button className="icon-btn" onClick={() => go(1)} aria-label="Halaman berikutnya"><ArrowCircle /></button>
    </div>
  );
}
