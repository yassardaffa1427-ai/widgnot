const { app, BrowserWindow, screen, ipcMain, globalShortcut, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const { execFile, exec } = require('child_process');

let mainWindow = null;
let tray = null;
let mediaPollTimer = null;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { x, y, width, height } = primaryDisplay.workArea;

  const appIconPath = path.join(__dirname, '../build/icon.png');
  const icon = fs.existsSync(appIconPath) ? nativeImage.createFromPath(appIconPath) : undefined;

  mainWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    icon,
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

  // Windows Media Session controls
  ipcMain.on('toggle-os-media', () => {
    exec('powershell -NoProfile -Command "(New-Object -ComObject Wscript.Shell).SendKeys([char]179)"', { windowsHide: true });
  });

  ipcMain.on('next-os-media', () => {
    exec('powershell -NoProfile -Command "(New-Object -ComObject Wscript.Shell).SendKeys([char]176)"', { windowsHide: true });
  });

  ipcMain.on('prev-os-media', () => {
    exec('powershell -NoProfile -Command "(New-Object -ComObject Wscript.Shell).SendKeys([char]177)"', { windowsHide: true });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const fs = require('fs');

function getScriptPath() {
  const targetPath = path.join(app.getPath('userData'), 'get-media.ps1');
  try {
    const bundledScriptPath = path.join(__dirname, 'get-media.ps1');
    if (fs.existsSync(bundledScriptPath)) {
      const content = fs.readFileSync(bundledScriptPath, 'utf8');
      fs.writeFileSync(targetPath, content, 'utf8');
      return targetPath;
    }
  } catch (err) {
    console.error('Failed to copy get-media.ps1:', err);
  }
  return targetPath;
}

// Background media tracking for Spotify, YouTube, and other laptop players
function startMediaTracking() {
  if (process.platform !== 'win32') return;

  const scriptPath = getScriptPath();
  let isPolling = false;

  const pollMedia = () => {
    if (isPolling) return;
    if (!mainWindow || mainWindow.isDestroyed()) return;
    isPolling = true;

    execFile(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath],
      { windowsHide: true, timeout: 3500 },
      (err, stdout) => {
        isPolling = false;
        if (!err && stdout && mainWindow && !mainWindow.isDestroyed()) {
          try {
            const data = JSON.parse(stdout.trim());
            mainWindow.webContents.send('os-media-update', data);
          } catch {
            // ignore non-json
          }
        }
      }
    );
  };

  // Poll every 2 seconds
  mediaPollTimer = setInterval(pollMedia, 2000);
  setTimeout(pollMedia, 1000);
}

function createTray() {
  try {
    const icoPath = path.join(__dirname, '../build/icon.ico');
    const pngPath = path.join(__dirname, '../build/icon.png');
    let icon;
    if (fs.existsSync(icoPath)) {
      icon = nativeImage.createFromPath(icoPath).resize({ width: 16, height: 16 });
    } else if (fs.existsSync(pngPath)) {
      icon = nativeImage.createFromPath(pngPath).resize({ width: 16, height: 16 });
    } else {
      const size = 16;
      const buffer = Buffer.alloc(size * size * 4);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const dx = x - size / 2;
          const dy = y - size / 2;
          if (dx * dx + dy * dy <= (size / 2 - 1) * (size / 2 - 1)) {
            buffer[idx] = 255;
            buffer[idx + 1] = 136;
            buffer[idx + 2] = 0;
            buffer[idx + 3] = 255;
          }
        }
      }
      icon = nativeImage.createFromBuffer(buffer, { width: size, height: size });
    }
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
  startMediaTracking();

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
  if (mediaPollTimer) clearInterval(mediaPollTimer);
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
