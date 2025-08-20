export interface ModFile {
  id: string;
  name: string;
  fileName: string;
  path: string;
  type: 'package' | 'script' | 'cfg';
  enabled: boolean;
  version?: string;
  author?: string;
  description?: string;
  fileSize: number;
  dateAdded: Date;
  dateModified: Date;
  thumbnail?: string;
  conflicts?: string[];
  dependencies?: string[];
}

export interface ModCategory {
  id: string;
  name: string;
  icon: string;
  modCount: number;
}

export interface GitCommit {
  hash: string;
  message: string;
  date: Date;
  author: string;
  filesChanged: string[];
}

export interface Settings {
  simsInstallPath: string;
  modsPath: string;
  autoGitCommit: boolean;
  autoBackup: boolean;
  scanInterval: number;
  theme: 'dark' | 'light';
  language: string;
  notifications: boolean;
  checkForUpdates: boolean;
}

export interface AppState {
  mods: ModFile[];
  categories: ModCategory[];
  settings: Settings;
  selectedMod?: ModFile;
  loading: boolean;
  error?: string;
  currentView: 'dashboard' | 'library' | 'curseforge' | 'history' | 'settings';
}

export interface IPCMessage {
  type: string;
  payload?: any;
  id?: string;
}

export interface ModStats {
  totalMods: number;
  enabledMods: number;
  disabledMods: number;
  conflicts: number;
  totalSize: string;
  lastUpdate: Date;
}