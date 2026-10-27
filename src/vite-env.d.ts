/// <reference types="vite/client" />

interface OSMediaData {
  hasMedia: boolean;
  title?: string;
  artist?: string;
  album?: string;
  appId?: string;
  status?: string;
  playing?: boolean;
  position?: number;
  duration?: number;
  source?: 'spotify' | 'youtube' | string;
  thumbnail?: string;
}

interface BluetoothData {
  enabled: boolean;
  connected: boolean;
  deviceName?: string;
}

interface Window {
  electronAPI?: {
    isElectron?: boolean;
    setInteractive: (interactive: boolean) => void;
    closeApp: () => void;
    onToggleIsland: (callback: () => void) => () => void;
    onOSMediaUpdate: (callback: (data: OSMediaData) => void) => () => void;
    toggleOSMedia: () => void;
    nextOSMedia: () => void;
    prevOSMedia: () => void;
    getBluetoothStatus?: () => Promise<BluetoothData>;
    toggleBluetooth?: () => Promise<BluetoothData>;
    onBluetoothUpdate?: (callback: (data: BluetoothData) => void) => () => void;
    updateWidgetBounds?: (bounds: {
      x: number;
      y: number;
      w: number;
      h: number;
      open: boolean;
      dragging: boolean;
    }) => void;
  };
}
