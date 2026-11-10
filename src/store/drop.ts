import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DropItem {
  id: string;
  dataUrl: string;
  name: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
  createdAt: number;
}

interface DropState {
  items: DropItem[];
  selectedId: string | null;
  compact: boolean;
  addItem: (item: Omit<DropItem, 'id' | 'createdAt'>) => string;
  removeItem: (id: string) => void;
  clearAll: () => void;
  selectItem: (id: string) => void;
  setCompact: (compact: boolean) => void;
  toggleCompact: () => void;
}

/** Helper to convert image data URL to a real File object */
export function dataUrlToFile(dataUrl: string, filename = 'image.png'): File {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(parts[1] || '');
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/** Helper to setup rich dataTransfer payload when dragging image out of Widgnot */
export function setupImageDragOut(e: React.DragEvent, item: DropItem) {
  const filename = item.name.includes('.') ? item.name : `${item.name}.png`;
  const mime = item.dataUrl.split(';')[0].split(':')[1] || 'image/png';

  try {
    const file = dataUrlToFile(item.dataUrl, filename);
    e.dataTransfer.items.add(file);
  } catch (err) {
    console.warn('Could not add file to dataTransfer.items:', err);
  }

  try {
    e.dataTransfer.setData('DownloadURL', `${mime}:${filename}:${item.dataUrl}`);
  } catch {}

  try {
    e.dataTransfer.setData('text/html', `<img src="${item.dataUrl}" alt="${filename}">`);
  } catch {}

  try {
    e.dataTransfer.setData('text/uri-list', item.dataUrl);
    e.dataTransfer.setData('text/plain', item.dataUrl);
  } catch {}

  e.dataTransfer.effectAllowed = 'copyMove';
}

/** Helper to copy image data URL to OS clipboard as PNG blob */
export async function copyDropItemToClipboard(dataUrl: string): Promise<boolean> {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    let pngBlob = blob;

    if (blob.type !== 'image/png') {
      pngBlob = await new Promise<Blob>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 300;
          canvas.height = img.naturalHeight || 300;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((b) => resolve(b || blob), 'image/png');
          } else {
            resolve(blob);
          }
        };
        img.onerror = () => resolve(blob);
        img.src = dataUrl;
      });
    }

    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob }),
      ]);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to copy image to clipboard:', err);
    return false;
  }
}

export const useDrop = create<DropState>()(
  persist(
    (set) => ({
      items: [],
      selectedId: null,
      compact: false,
      addItem: (item) => {
        const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
        const newItem: DropItem = {
          ...item,
          id,
          createdAt: Date.now(),
        };
        set((s) => ({
          items: [newItem, ...s.items],
          selectedId: id,
        }));
        return id;
      },
      removeItem: (id) =>
        set((s) => ({
          items: s.items.filter((it) => it.id !== id),
          selectedId: s.selectedId === id ? s.items.find((it) => it.id !== id)?.id || null : s.selectedId,
        })),
      clearAll: () => set({ items: [], selectedId: null }),
      selectItem: (id) => set({ selectedId: id }),
      setCompact: (compact) => set({ compact }),
      toggleCompact: () => set((s) => ({ compact: !s.compact })),
    }),
    { name: 'widgnot:drop:v1' },
  ),
);
