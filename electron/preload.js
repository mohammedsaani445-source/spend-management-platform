const { contextBridge, ipcRenderer } = require('electron');

// Branded bridge for future native feature expansion
contextBridge.exposeInMainWorld('apexNative', {
    platform: process.platform,
    version: process.versions.electron
});
