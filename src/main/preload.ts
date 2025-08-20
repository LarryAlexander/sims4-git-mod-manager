import { contextBridge, ipcRenderer } from 'electron';

// Define the API interface
export interface ElectronAPI {
  // Mod management
  mod: {
    scan: () => Promise<any[]>;
    enable: (modId: string) => Promise<{ success: boolean }>;
    disable: (modId: string) => Promise<{ success: boolean }>;
  };

  // Git operations
  git: {
    getHistory: () => Promise<any[]>;
    rollback: (commitHash: string) => Promise<{ success: boolean }>;
  };

  // Database operations
  db: {
    initialize: () => Promise<{ success: boolean }>;
  };

  // File dialogs
  dialog: {
    selectFolder: () => Promise<string | null>;
  };

  // App information
  app: {
    getVersion: () => Promise<string>;
    getName: () => Promise<string>;
  };
}

// Expose the API to the renderer process
const electronAPI: ElectronAPI = {
  mod: {
    scan: () => ipcRenderer.invoke('mod:scan'),
    enable: (modId: string) => ipcRenderer.invoke('mod:enable', modId),
    disable: (modId: string) => ipcRenderer.invoke('mod:disable', modId),
  },
  git: {
    getHistory: () => ipcRenderer.invoke('git:history'),
    rollback: (commitHash: string) => ipcRenderer.invoke('git:rollback', commitHash),
  },
  db: {
    initialize: () => ipcRenderer.invoke('db:init'),
  },
  dialog: {
    selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getName: () => ipcRenderer.invoke('app:getName'),
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for the renderer process
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}