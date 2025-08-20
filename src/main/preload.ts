import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Mod management
  scanMods: () => ipcRenderer.invoke(IPC_CHANNELS.SCAN_MODS),
  getMods: () => ipcRenderer.invoke(IPC_CHANNELS.GET_MODS),
  toggleMod: (modId: string) => ipcRenderer.invoke(IPC_CHANNELS.TOGGLE_MOD, modId),
  deleteMod: (modId: string) => ipcRenderer.invoke(IPC_CHANNELS.DELETE_MOD, modId),
  
  // Git operations
  initGit: () => ipcRenderer.invoke(IPC_CHANNELS.INIT_GIT),
  commitChanges: (message: string) => ipcRenderer.invoke(IPC_CHANNELS.COMMIT_CHANGES, message),
  getHistory: () => ipcRenderer.invoke(IPC_CHANNELS.GET_HISTORY),
  revertCommit: (hash: string) => ipcRenderer.invoke(IPC_CHANNELS.REVERT_COMMIT, hash),
  
  // Settings
  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SETTINGS),
  updateSettings: (settings: any) => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_SETTINGS, settings),
  detectSimsPath: () => ipcRenderer.invoke(IPC_CHANNELS.DETECT_SIMS_PATH),
  
  // File operations
  openModsFolder: () => ipcRenderer.invoke(IPC_CHANNELS.OPEN_MODS_FOLDER),
  importMod: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.IMPORT_MOD, filePath),
  exportMod: (modId: string, targetPath: string) => ipcRenderer.invoke(IPC_CHANNELS.EXPORT_MOD, modId, targetPath),
  
  // System
  getSystemInfo: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SYSTEM_INFO),
  showMessage: (options: any) => ipcRenderer.invoke(IPC_CHANNELS.SHOW_MESSAGE, options),
  openExternal: (url: string) => ipcRenderer.invoke(IPC_CHANNELS.OPEN_EXTERNAL, url),
  
  // Event listeners
  onMenuAction: (callback: (action: string) => void) => {
    ipcRenderer.on('menu-scan-mods', () => callback('scan-mods'));
  },
  
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('menu-scan-mods');
  },
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      scanMods: () => Promise<any>;
      getMods: () => Promise<any>;
      toggleMod: (modId: string) => Promise<any>;
      deleteMod: (modId: string) => Promise<any>;
      initGit: () => Promise<any>;
      commitChanges: (message: string) => Promise<any>;
      getHistory: () => Promise<any>;
      revertCommit: (hash: string) => Promise<any>;
      getSettings: () => Promise<any>;
      updateSettings: (settings: any) => Promise<any>;
      detectSimsPath: () => Promise<any>;
      openModsFolder: () => Promise<void>;
      importMod: (filePath: string) => Promise<any>;
      exportMod: (modId: string, targetPath: string) => Promise<any>;
      getSystemInfo: () => Promise<any>;
      showMessage: (options: any) => Promise<any>;
      openExternal: (url: string) => Promise<void>;
      onMenuAction: (callback: (action: string) => void) => void;
      removeAllListeners: () => void;
    };
  }
}