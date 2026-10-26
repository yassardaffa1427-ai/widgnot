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
});
