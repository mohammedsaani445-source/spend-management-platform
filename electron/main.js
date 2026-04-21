const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.min(1440, width),
    height: Math.min(900, height),
    webPreferences: {
      nodeIntegration: false,
      contextBridge: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false, // Don't show until ready-to-show to avoid white flash
    title: "Apex Procure",
    icon: path.join(__dirname, '../public/icon.png'),
    autoHideMenuBar: true,
    backgroundColor: '#ffffff'
  });

  const startUrl = process.env.ELECTRON_DEV_URL || 'https://apexprocure.vercel.app';
  
  console.log('[Electron] Attempting to load:', startUrl);

  // Load the URL
  mainWindow.loadURL(startUrl).catch(err => {
    console.error('[Electron] Initial load failed:', err);
  });

  // If loading fails, show the local error page
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.warn(`[Electron] Failed to load URL "${validatedURL}": ${errorDescription} (${errorCode})`);
    
    // Fallback to error page if it's the main entry point
    if (validatedURL === startUrl || !mainWindow.webContents.getURL().includes('error.html')) {
        mainWindow.loadFile(path.join(__dirname, 'error.html')).catch(e => {
            console.error('[Electron] Failed to load local error page:', e);
        });
    }
  });

  // Performance recording and console logger
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    const levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR'];
    console.log(`[Browser Console ${levels[level] || level}] ${message} (${sourceId}:${line})`);
  });

  // Handle when the window is ready to be shown
  mainWindow.once('ready-to-show', () => {
    console.log('[Electron] Page is ready to show');
    mainWindow.show();
  });

  // Fallback: If it takes too long to render, show anyway (unless it already crashed)
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      console.warn('[Electron] Page load timeout. Forcing show.');
      mainWindow.show();
    }
  }, 10000);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Handle single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on('ready', createWindow);
}

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
