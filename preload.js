const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  loadPrices: () => ipcRenderer.invoke('load-prices'),
  savePrices: (data) => ipcRenderer.invoke('save-prices', data),
  openAdmin: () => ipcRenderer.send('open-admin')
});
