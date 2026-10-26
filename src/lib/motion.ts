/**
 * Konfigurasi spring untuk nuansa "liquid" ala Dynamic Island.
 * damping rendah (~26) = sedikit overshoot -> kesan cairan.
 * Ubah angka di sini saja untuk menyetel seluruh animasi.
 */
export const islandSpring = { type: 'spring', stiffness: 300, damping: 26, mass: 0.9 } as const;
export const snapSpring = { type: 'spring', stiffness: 260, damping: 24, mass: 0.8 } as const;
export const contentSpring = { type: 'spring', stiffness: 420, damping: 34 } as const;
export const instant = { duration: 0 } as const;
