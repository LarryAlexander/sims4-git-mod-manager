// IPC Channel constants
export const IPC_CHANNELS = {
  // Mod management
  SCAN_MODS: 'scan-mods',
  GET_MODS: 'get-mods',
  TOGGLE_MOD: 'toggle-mod',
  DELETE_MOD: 'delete-mod',
  
  // Git operations
  INIT_GIT: 'init-git',
  COMMIT_CHANGES: 'commit-changes',
  GET_HISTORY: 'get-history',
  REVERT_COMMIT: 'revert-commit',
  
  // Settings
  GET_SETTINGS: 'get-settings',
  UPDATE_SETTINGS: 'update-settings',
  DETECT_SIMS_PATH: 'detect-sims-path',
  
  // File operations
  OPEN_MODS_FOLDER: 'open-mods-folder',
  IMPORT_MOD: 'import-mod',
  EXPORT_MOD: 'export-mod',
  
  // System
  GET_SYSTEM_INFO: 'get-system-info',
  SHOW_MESSAGE: 'show-message',
  OPEN_EXTERNAL: 'open-external',
} as const;

export const DEFAULT_SETTINGS = {
  simsInstallPath: '',
  modsPath: '',
  autoGitCommit: true,
  autoBackup: true,
  scanInterval: 30,
  theme: 'dark' as const,
  language: 'en',
  notifications: true,
  checkForUpdates: true,
};

export const MOD_FILE_EXTENSIONS = ['.package', '.ts4script', '.cfg'];

export const SIMS4_PATHS = {
  WINDOWS: {
    DOCUMENTS: 'Electronic Arts/The Sims 4',
    MODS: 'Electronic Arts/The Sims 4/Mods',
    INSTALL: [
      'C:/Program Files (x86)/Origin Games/The Sims 4',
      'C:/Program Files/Origin Games/The Sims 4',
      'C:/Program Files (x86)/Electronic Arts/The Sims 4',
      'C:/Program Files/Electronic Arts/The Sims 4',
      'C:/Program Files (x86)/Steam/steamapps/common/The Sims 4',
      'C:/Program Files/Steam/steamapps/common/The Sims 4',
    ],
  },
};