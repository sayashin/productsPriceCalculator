// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

app.disableHardwareAcceleration();

let mainWindow;
let adminWindow;

// ---- Paths & seed helpers ----
function defaultPricesPath() {
  // bundled read-only file (dev: project dir, prod: resources)
  return app.isPackaged
    ? path.join(process.resourcesPath, 'prices.json')
    : path.join(__dirname, 'prices.json');
}
function userDataPricesPath() {
  return path.join(app.getPath('userData'), 'prices.json');
}
function ensureSeeded() {
  const dst = userDataPricesPath();
  if (!fs.existsSync(dst)) {
    const src = defaultPricesPath();
    const data = fs.readFileSync(src);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, data);
  }
}
function readUserPrices() {
  ensureSeeded();
  const data = fs.readFileSync(userDataPricesPath(), 'utf8');
  return JSON.parse(data);
}
function writeUserPrices(obj) {
  fs.writeFileSync(userDataPricesPath(), JSON.stringify(obj, null, 2));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 900,
    resizable: false,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webgl: false
    },
  });
  mainWindow.loadFile('index.html');
}

function createAdminWindow() {
  adminWindow = new BrowserWindow({
    width: 500,
    height: 650,
    resizable: false,
    title: 'Manage Prices',
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  adminWindow.loadFile('admin.html');
  adminWindow.on('closed', () => (adminWindow = null));
}

ipcMain.handle('load-prices', async () => {
  return readUserPrices();
});

ipcMain.handle('save-prices', async (_, updatedPrices) => {
  writeUserPrices(updatedPrices);
  // notify all renderer windows to refresh
  for (const w of BrowserWindow.getAllWindows()) {
    w.webContents.send('prices-updated', updatedPrices);
  }
  return true;
});

ipcMain.on('open-admin', () => {
  if (adminWindow && !adminWindow.isDestroyed()) adminWindow.focus();
  else createAdminWindow();
});

app.whenReady().then(() => {
  ensureSeeded();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
