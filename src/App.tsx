import { useEffect } from 'react';
import { Island } from './components/island/Island';
import { DesktopShell } from './components/desktop/DesktopShell';
import { useTimer } from './store/timer';
import { useUI } from './store/ui';

declare global {
  interface Window {
    electronAPI?: {
      isElectron?: boolean;
      setInteractive: (interactive: boolean) => void;
      closeApp: () => void;
      onToggleIsland: (callback: () => void) => () => void;
    };
  }
}

export default function App() {
  const isElectron = Boolean(
    typeof window !== 'undefined' &&
      (window.electronAPI?.isElectron || navigator.userAgent.toLowerCase().includes('electron'))
  );

  const { setOpen, goTo } = useUI();

  // satu ticker global supaya timer tetap jalan walau island tertutup
  useEffect(() => {
    const id = setInterval(() => useTimer.getState().tick(), 250);
    return () => clearInterval(id);
  }, []);

  // Set html class untuk mode desktop transparan
  useEffect(() => {
    if (isElectron) {
      document.documentElement.classList.add('is-electron');
    }
  }, [isElectron]);

  // Global hotkey Alt+W dari Electron
  useEffect(() => {
    if (!window.electronAPI?.onToggleIsland) return;
    const unsub = window.electronAPI.onToggleIsland(() => {
      const currentOpen = useUI.getState().open;
      if (!currentOpen) goTo('music');
      setOpen(!currentOpen);
    });
    return unsub;
  }, [goTo, setOpen]);

  if (isElectron) {
    return (
      <div className="desktop-overlay">
        <Island />
      </div>
    );
  }

  return (
    <DesktopShell>
      <Island />
    </DesktopShell>
  );
}
