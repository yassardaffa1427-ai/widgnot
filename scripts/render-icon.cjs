const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 512,
    height: 512,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: {
      offscreen: true,
    },
  });

  const svgPath = path.join(__dirname, '../public/icon.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 512px; height: 512px; overflow: hidden; background: transparent; display: grid; place-items: center; }
    svg { width: 512px; height: 512px; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

  // Wait 400ms for SVG rendering and filters to apply cleanly
  await new Promise((r) => setTimeout(r, 500));

  const image = await win.webContents.capturePage({ x: 0, y: 0, width: 512, height: 512 });
  const pngBuffer = image.toPNG();

  fs.writeFileSync(path.join(__dirname, '../build/icon.png'), pngBuffer);
  fs.writeFileSync(path.join(__dirname, '../public/preview-icon.png'), pngBuffer);
  console.log('Icon rendered successfully! Size:', pngBuffer.length);

  app.quit();
});
