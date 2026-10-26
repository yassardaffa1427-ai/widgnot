const { app, BrowserWindow, screen, ipcMain, globalShortcut, Menu, Tray, nativeImage } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { x, y, width, height } = primaryDisplay.workArea;

  mainWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
    },
  });

  // Enable click-through for transparent areas initially
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (!app.isPackaged && devUrl) {
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Interactivity IPC: when mouse enters island, capture clicks. When outside, pass clicks through.
  ipcMain.on('set-interactive', (_, interactive) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (interactive) {
        mainWindow.setIgnoreMouseEvents(false);
      } else {
        mainWindow.setIgnoreMouseEvents(true, { forward: true });
      }
    }
  });

  ipcMain.on('close-app', () => {
    app.quit();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  try {
    const size = 16;
    const buffer = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const dx = x - size / 2;
        const dy = y - size / 2;
        if (dx * dx + dy * dy <= (size / 2 - 1) * (size / 2 - 1)) {
          buffer[idx] = 255;     // B
          buffer[idx + 1] = 136; // G
          buffer[idx + 2] = 0;   // R
          buffer[idx + 3] = 255; // A
        }
      }
    }
    const icon = nativeImage.createFromBuffer(buffer, { width: size, height: size });
    tray = new Tray(icon);
    tray.setToolTip('Widgnot — Hidden Island Widget (Alt+W)');
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Buka / Tutup Widgnot (Alt+W)',
        click: () => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('toggle-island');
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Keluar (Quit)',
        click: () => {
          app.quit();
        },
      },
    ]);
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('toggle-island');
      }
    });
  } catch (err) {
    console.error('Failed to create tray:', err);
  }
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Global hotkey: Alt + W to toggle Widgnot anywhere on Windows
  globalShortcut.register('Alt+W', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('toggle-island');
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
