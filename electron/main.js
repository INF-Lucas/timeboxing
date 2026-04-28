const { app, BrowserWindow, Menu, session } = require('electron');
const path = require('path');

process.on('uncaughtException', (error) => {
  if (!error) return;

  const isENOENT = error.code === 'ENOENT';
  const pathToCheck = error.path || error.message || '';

  const isTemp = pathToCheck.includes('/var/folders/') || 
                 pathToCheck.includes('.io.github.inf-lucas.timeboxing') || 
                 pathToCheck.includes('Scoped');

  if (isENOENT || (isTemp && error.name === 'Error')) {
    if (isTemp) {
      console.warn('Ignored system ENOENT error for temp file:', error.path || error.message);
      return; 
    }
  }

  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

const isDev = process.env.ELECTRON_DEV === 'true';
const isMac = process.platform === 'darwin';

let mainWindow;
let isQuiting = false;
let server = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      devTools: isDev,
      partition: 'persist:timeboxing-open-source',
      session: session.fromPartition('persist:timeboxing-open-source'),
    },
    titleBarStyle: 'default',
    show: false,
    icon: path.join(__dirname, '../public/app-icon.icns')
  });
  if (isMac) {
    mainWindow.on('close', (e) => {
      if (!isQuiting) {
        e.preventDefault();
        mainWindow.hide();
        return;
      }
    });
  }

  const staticDir = path.join(__dirname, '../out');

  if (isDev) {
    const HOST = process.env.ELECTRON_HOST || '127.0.0.1';
    const PORT = Number(process.env.PORT || 17895);
    const startUrl = `http://${HOST}:${PORT}`;
    console.log('Loading URL:', startUrl);
    mainWindow.loadURL(startUrl);
  } else {
    const http = require('http');
    const serveHandler = require('serve-handler');

    if (!server) {
      server = http.createServer((req, res) =>
        serveHandler(req, res, { public: staticDir, cleanUrls: true })
      );
      const HOST = process.env.ELECTRON_HOST || '127.0.0.1';
      const PORT = Number(process.env.ELECTRON_STATIC_PORT) || 17895;

      server.listen(PORT, HOST, () => {
        const startUrl = `http://${HOST}:${PORT}`;
        console.log('Loading URL:', startUrl);
        mainWindow.loadURL(startUrl);
      });

      server.on('error', (err) => {
        console.error('Static server error:', err);
      });
    } else {
      const HOST = process.env.ELECTRON_HOST || '127.0.0.1';
      const PORT = Number(process.env.ELECTRON_STATIC_PORT) || 17895;
      mainWindow.loadURL(`http://${HOST}:${PORT}`);
    }
  }

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createMenu();
    createWindow();
  });
}

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuiting = true;
});

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show();
  } else {
    createWindow();
  }
});

app.on('will-quit', () => {
  if (server) {
    server.close();
    server = null;
  }
});

function createMenu() {
  const template = [
    {
      label: 'Timeboxing',
      submenu: [
        {
          label: 'About Timeboxing',
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'Command+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+Command+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Command+X', role: 'cut' },
        { label: 'Copy', accelerator: 'Command+C', role: 'copy' },
        { label: 'Paste', accelerator: 'Command+V', role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'Command+R', role: 'reload' },
        { label: 'Force Reload', accelerator: 'Command+Shift+R', role: 'forceReload' },
        { label: 'Developer Tools', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Actual Size', accelerator: 'Command+0', role: 'resetZoom' },
        { label: 'Zoom In', accelerator: 'Command+Plus', role: 'zoomIn' },
        { label: 'Zoom Out', accelerator: 'Command+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'Toggle Full Screen', accelerator: 'Control+Command+F', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Minimize', accelerator: 'Command+M', role: 'minimize' },
        { label: 'Close', accelerator: 'Command+W', role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
