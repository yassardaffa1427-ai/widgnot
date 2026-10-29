import { useEffect } from 'react';
import { Island } from './components/island/Island';
import { DesktopShell } from './components/desktop/DesktopShell';
import { useTimer } from './store/timer';
import { useUI } from './store/ui';
import { useMusic } from './store/music';
import { useData } from './store/data';

export default function App() {
  const isElectron = Boolean(
    typeof window !== 'undefined' &&
      (window.electronAPI?.isElectron || navigator.userAgent.toLowerCase().includes('electron'))
  );

  const { setOpen, goTo } = useUI();
  const autoHide = useData((s) => s.autoHide);

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

  // Listener media laptop dari Electron (Spotify, YouTube, browser media)
  useEffect(() => {
    if (!window.electronAPI?.onOSMediaUpdate) return;
    const unsub = window.electronAPI.onOSMediaUpdate((data) => {
      useMusic.getState().handleOSMedia(data);
    });
    return unsub;
  }, []);

  // Listener status Bluetooth laptop dari Electron
  useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.getBluetoothStatus?.().then((data) => {
      if (data) useMusic.getState().handleBluetoothUpdate(data);
    });
    if (!window.electronAPI.onBluetoothUpdate) return;
    const unsub = window.electronAPI.onBluetoothUpdate((data) => {
      useMusic.getState().handleBluetoothUpdate(data);
    });
    return unsub;
  }, []);

  // Sync auto-hide toggle dari tray context menu Electron
  useEffect(() => {
    if (!window.electronAPI?.onSetAutoHide) return;
    const unsub = window.electronAPI.onSetAutoHide((val) => {
      useData.getState().setAutoHide(val);
    });
    return unsub;
  }, []);

  // Sync perubahan state autoHide dari frontend ke tray Electron
  useEffect(() => {
    window.electronAPI?.notifyAutoHideChanged?.(autoHide);
  }, [autoHide]);

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
