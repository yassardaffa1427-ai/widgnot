import { invoke, isTauri } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

export function initTauriBridge() {
  if (!isTauri()) return;

  window.electronAPI = {
    isElectron: true,
    setInteractive: (interactive: boolean) => {
      void invoke('set_interactive', { interactive });
    },
    closeApp: () => {
      void invoke('close_app');
    },
    onToggleIsland: (callback: () => void) => {
      let unlisten: (() => void) | null = null;
      void listen('toggle-island', () => callback()).then((fn) => {
        unlisten = fn;
      });
      return () => {
        if (unlisten) unlisten();
      };
    },
    onOSMediaUpdate: (callback: (data: OSMediaData) => void) => {
      let unlisten: (() => void) | null = null;
      void listen<OSMediaData>('os-media-update', (event) => callback(event.payload)).then((fn) => {
        unlisten = fn;
      });
      return () => {
        if (unlisten) unlisten();
      };
    },
    toggleOSMedia: () => {
      void invoke('toggle_os_media');
    },
    nextOSMedia: () => {
      void invoke('next_os_media');
    },
    prevOSMedia: () => {
      void invoke('prev_os_media');
    },
    getBluetoothStatus: () => {
      return invoke<BluetoothData>('get_bluetooth_status');
    },
    toggleBluetooth: () => {
      return invoke<BluetoothData>('toggle_bluetooth');
    },
    onBluetoothUpdate: (callback: (data: BluetoothData) => void) => {
      let unlisten: (() => void) | null = null;
      void listen<BluetoothData>('bluetooth-update', (event) => callback(event.payload)).then((fn) => {
        unlisten = fn;
      });
      return () => {
        if (unlisten) unlisten();
      };
    },
  };
}
