const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  setInteractive: (interactive) => ipcRenderer.send('set-interactive', interactive),
  closeApp: () => ipcRenderer.send('close-app'),
  onToggleIsland: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('toggle-island', handler);
    return () => ipcRenderer.removeListener('toggle-island', handler);
  },
  onOSMediaUpdate: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on('os-media-update', handler);
    return () => ipcRenderer.removeListener('os-media-update', handler);
  },
  toggleOSMedia: () => ipcRenderer.send('toggle-os-media'),
  nextOSMedia: () => ipcRenderer.send('next-os-media'),
  prevOSMedia: () => ipcRenderer.send('prev-os-media'),
  getBluetoothStatus: () => ipcRenderer.invoke('get-bluetooth-status'),
  toggleBluetooth: () => ipcRenderer.invoke('toggle-bluetooth'),
  onBluetoothUpdate: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on('bluetooth-update', handler);
    return () => ipcRenderer.removeListener('bluetooth-update', handler);
  },
});
