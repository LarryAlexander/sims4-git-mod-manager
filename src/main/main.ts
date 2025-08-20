import { app, BrowserWindow, ipcMain, Menu, shell, dialog } from 'electron';
import { join } from 'path';
import { isDev } from './utils';
import { ModService } from '../services/ModService';
import { GitService } from '../services/GitService';
import { DatabaseService } from '../services/DatabaseService';
import { SettingsService } from '../services/SettingsService';
import { IPC_CHANNELS } from '../shared/constants';

class MainApp {
  private mainWindow: BrowserWindow | null = null;
  private modService: ModService;
  private gitService: GitService;
  private databaseService: DatabaseService;
  private settingsService: SettingsService;

  constructor() {
    this.databaseService = new DatabaseService();
    this.settingsService = new SettingsService();
    this.modService = new ModService(this.databaseService);
    this.gitService = new GitService();
  }

  async initialize(): Promise<void> {
    await this.databaseService.initialize();
    await this.settingsService.initialize();
    
    this.createWindow();
    this.setupIPC();
    this.createMenu();
  }

  private createWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      show: false,
      icon: join(__dirname, '../../public/icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, 'preload.js'),
      },
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: '#1976d2',
        symbolColor: '#ffffff',
      },
    });

    const startUrl = isDev 
      ? 'http://localhost:3000' 
      : `file://${join(__dirname, '../renderer/index.html')}`;

    this.mainWindow.loadURL(startUrl);

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      
      if (isDev) {
        this.mainWindow?.webContents.openDevTools();
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupIPC(): void {
    // Mod management
    ipcMain.handle(IPC_CHANNELS.SCAN_MODS, async () => {
      try {
        const settings = await this.settingsService.getSettings();
        return await this.modService.scanMods(settings.modsPath);
      } catch (error) {
        console.error('Error scanning mods:', error);
        throw error;
      }
    });

    ipcMain.handle(IPC_CHANNELS.GET_MODS, async () => {
      try {
        return await this.modService.getMods();
      } catch (error) {
        console.error('Error getting mods:', error);
        throw error;
      }
    });

    ipcMain.handle(IPC_CHANNELS.TOGGLE_MOD, async (_, modId: string) => {
      try {
        const result = await this.modService.toggleMod(modId);
        
        // Auto-commit if enabled
        const settings = await this.settingsService.getSettings();
        if (settings.autoGitCommit && settings.modsPath) {
          const mod = await this.modService.getModById(modId);
          const message = `${result.enabled ? 'Enabled' : 'Disabled'} mod: ${mod?.name}`;
          await this.gitService.commitChanges(settings.modsPath, message);
        }
        
        return result;
      } catch (error) {
        console.error('Error toggling mod:', error);
        throw error;
      }
    });

    // Git operations
    ipcMain.handle(IPC_CHANNELS.INIT_GIT, async () => {
      try {
        const settings = await this.settingsService.getSettings();
        if (settings.modsPath) {
          return await this.gitService.initializeRepository(settings.modsPath);
        }
        throw new Error('Mods path not configured');
      } catch (error) {
        console.error('Error initializing git:', error);
        throw error;
      }
    });

    ipcMain.handle(IPC_CHANNELS.GET_HISTORY, async () => {
      try {
        const settings = await this.settingsService.getSettings();
        if (settings.modsPath) {
          return await this.gitService.getHistory(settings.modsPath);
        }
        return [];
      } catch (error) {
        console.error('Error getting git history:', error);
        throw error;
      }
    });

    // Settings
    ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, async () => {
      try {
        return await this.settingsService.getSettings();
      } catch (error) {
        console.error('Error getting settings:', error);
        throw error;
      }
    });

    ipcMain.handle(IPC_CHANNELS.UPDATE_SETTINGS, async (_, settings) => {
      try {
        return await this.settingsService.updateSettings(settings);
      } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
      }
    });

    ipcMain.handle(IPC_CHANNELS.DETECT_SIMS_PATH, async () => {
      try {
        return await this.settingsService.detectSimsPath();
      } catch (error) {
        console.error('Error detecting Sims path:', error);
        throw error;
      }
    });

    // File operations
    ipcMain.handle(IPC_CHANNELS.OPEN_MODS_FOLDER, async () => {
      try {
        const settings = await this.settingsService.getSettings();
        if (settings.modsPath) {
          shell.openPath(settings.modsPath);
        }
      } catch (error) {
        console.error('Error opening mods folder:', error);
        throw error;
      }
    });

    // System
    ipcMain.handle(IPC_CHANNELS.SHOW_MESSAGE, async (_, options) => {
      try {
        if (this.mainWindow) {
          return await dialog.showMessageBox(this.mainWindow, options);
        }
      } catch (error) {
        console.error('Error showing message:', error);
        throw error;
      }
    });

    ipcMain.handle(IPC_CHANNELS.OPEN_EXTERNAL, async (_, url: string) => {
      try {
        await shell.openExternal(url);
      } catch (error) {
        console.error('Error opening external URL:', error);
        throw error;
      }
    });
  }

  private createMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Scan for Mods',
            accelerator: 'CmdOrCtrl+R',
            click: () => {
              this.mainWindow?.webContents.send('menu-scan-mods');
            },
          },
          { type: 'separator' },
          {
            label: 'Open Mods Folder',
            accelerator: 'CmdOrCtrl+O',
            click: async () => {
              const settings = await this.settingsService.getSettings();
              if (settings.modsPath) {
                shell.openPath(settings.modsPath);
              }
            },
          },
          { type: 'separator' },
          {
            label: 'Exit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            },
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
        ],
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About',
            click: () => {
              dialog.showMessageBox(this.mainWindow!, {
                type: 'info',
                title: 'About Sims 4 Mod Manager',
                message: 'Sims 4 Mod Manager',
                detail: 'Revolutionary mod management with Git version control\nVersion 1.0.0',
              });
            },
          },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}

// App event handlers
app.whenReady().then(async () => {
  const mainApp = new MainApp();
  await mainApp.initialize();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    const mainApp = new MainApp();
    await mainApp.initialize();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (_, contents) => {
  contents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
});