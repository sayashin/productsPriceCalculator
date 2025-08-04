// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let adminWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 900,
    resizable: false,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
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
  const pricesPath = path.join(__dirname, 'prices.json');
  const data = fs.readFileSync(pricesPath);
  return JSON.parse(data);
});

ipcMain.handle('save-prices', async (_, updatedPrices) => {
  const pricesPath = path.join(__dirname, 'prices.json');
  fs.writeFileSync(pricesPath, JSON.stringify(updatedPrices, null, 2));
  return true;
});

ipcMain.on('open-admin', () => {
  if (adminWindow && !adminWindow.isDestroyed()) {
    adminWindow.focus();
  } else {
    createAdminWindow();
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
