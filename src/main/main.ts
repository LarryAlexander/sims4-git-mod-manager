import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { existsSync } from 'fs';

// Services
import { ModManager } from '../services/ModManager';
import { GitManager } from '../services/GitManager';
import { DatabaseManager } from '../services/DatabaseManager';

// Check if running in development
const isDev = process.env.NODE_ENV === 'development';

class MainProcess {
  private mainWindow: BrowserWindow | null = null;
  private modManager: ModManager;
  private gitManager: GitManager;
  private databaseManager: DatabaseManager;

  constructor() {
    this.modManager = new ModManager();
    this.gitManager = new GitManager();
    this.databaseManager = new DatabaseManager();
    
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupIpcHandlers();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, 'preload.js')
      },
      icon: this.getIconPath(),
      title: 'Sims 4 Git Mod Manager',
      show: false // Don't show until ready
    });

    // Load the renderer
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private getIconPath(): string {
    const iconPath = join(__dirname, '../../assets/icon.png');
    return existsSync(iconPath) ? iconPath : '';
  }

  private setupIpcHandlers(): void {
    // Mod management handlers
    ipcMain.handle('mod:scan', async () => {
      try {
        return await this.modManager.scanModsFolder();
      } catch (error) {
        console.error('Error scanning mods:', error);
        throw error;
      }
    });

    ipcMain.handle('mod:enable', async (_, modId: string) => {
      try {
        await this.modManager.enableMod(modId);
        // Create Git snapshot
        await this.gitManager.createSnapshot(`Enabled mod: ${modId}`);
        return { success: true };
      } catch (error) {
        console.error('Error enabling mod:', error);
        throw error;
      }
    });

    ipcMain.handle('mod:disable', async (_, modId: string) => {
      try {
        await this.modManager.disableMod(modId);
        // Create Git snapshot
        await this.gitManager.createSnapshot(`Disabled mod: ${modId}`);
        return { success: true };
      } catch (error) {
        console.error('Error disabling mod:', error);
        throw error;
      }
    });

    // Git handlers
    ipcMain.handle('git:history', async () => {
      try {
        return await this.gitManager.getHistory();
      } catch (error) {
        console.error('Error getting Git history:', error);
        throw error;
      }
    });

    ipcMain.handle('git:rollback', async (_, commitHash: string) => {
      try {
        await this.gitManager.rollbackToCommit(commitHash);
        return { success: true };
      } catch (error) {
        console.error('Error rolling back:', error);
        throw error;
      }
    });

    // Database handlers
    ipcMain.handle('db:init', async () => {
      try {
        await this.databaseManager.initialize();
        return { success: true };
      } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
      }
    });

    // File dialog handlers
    ipcMain.handle('dialog:selectFolder', async () => {
      if (!this.mainWindow) return null;
      
      const result = await dialog.showOpenDialog(this.mainWindow, {
        properties: ['openDirectory'],
        title: 'Select Sims 4 Mods Folder'
      });

      return result.canceled ? null : result.filePaths[0];
    });

    // App info handlers
    ipcMain.handle('app:getVersion', () => app.getVersion());
    ipcMain.handle('app:getName', () => app.getName());
  }
}

// Initialize the main process
new MainProcess();