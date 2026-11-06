import { contextBridge } from 'electron';

// Expose safe system info or IPC if needed in the future
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  version: '1.0.0'
});

