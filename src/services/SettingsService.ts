import { join } from 'path';
import { homedir } from 'os';
import { existsSync } from 'fs';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { app } from 'electron';
import { Settings } from '../shared/types';
import { DEFAULT_SETTINGS, SIMS4_PATHS } from '../shared/constants';

export class SettingsService {
  private settingsPath: string;
  private settings: Settings;

  constructor() {
    this.settingsPath = join(app.getPath('userData'), 'settings.json');
    this.settings = { ...DEFAULT_SETTINGS };
  }

  async initialize(): Promise<void> {
    try {
      await this.loadSettings();
      
      // Auto-detect paths if not configured
      if (!this.settings.simsInstallPath || !this.settings.modsPath) {
        const detectedPath = await this.detectSimsPath();
        if (detectedPath.modsPath && !this.settings.modsPath) {
          this.settings.modsPath = detectedPath.modsPath;
        }
        if (detectedPath.installPath && !this.settings.simsInstallPath) {
          this.settings.simsInstallPath = detectedPath.installPath;
        }
        await this.saveSettings();
      }
    } catch (error) {
      console.warn('Failed to load settings, using defaults:', error);
      await this.saveSettings();
    }
  }

  async loadSettings(): Promise<void> {
    if (!existsSync(this.settingsPath)) {
      return;
    }

    try {
      const data = await readFile(this.settingsPath, 'utf-8');
      const loadedSettings = JSON.parse(data);
      this.settings = { ...DEFAULT_SETTINGS, ...loadedSettings };
    } catch (error) {
      console.error('Failed to parse settings file:', error);
      throw error;
    }
  }

  async saveSettings(): Promise<void> {
    try {
      const settingsDir = join(app.getPath('userData'));
      
      // Ensure the directory exists
      if (!existsSync(settingsDir)) {
        await mkdir(settingsDir, { recursive: true });
      }

      await writeFile(this.settingsPath, JSON.stringify(this.settings, null, 2));
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  async getSettings(): Promise<Settings> {
    return { ...this.settings };
  }

  async updateSettings(newSettings: Partial<Settings>): Promise<Settings> {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
    return { ...this.settings };
  }

  async detectSimsPath(): Promise<{ installPath?: string; modsPath?: string }> {
    const result: { installPath?: string; modsPath?: string } = {};

    try {
      // Try to find Mods folder in Documents
      const documentsPath = join(homedir(), 'Documents');
      const modsPath = join(documentsPath, SIMS4_PATHS.WINDOWS.MODS);
      
      if (existsSync(modsPath)) {
        result.modsPath = modsPath;
      }

      // Try to find game installation
      for (const path of SIMS4_PATHS.WINDOWS.INSTALL) {
        if (existsSync(path)) {
          const gameExe = join(path, 'Game', 'Bin', 'TS4_x64.exe');
          if (existsSync(gameExe)) {
            result.installPath = path;
            break;
          }
        }
      }

      // If no mods path found in Documents, try to create it
      if (!result.modsPath) {
        const defaultModsPath = join(documentsPath, SIMS4_PATHS.WINDOWS.MODS);
        try {
          await mkdir(defaultModsPath, { recursive: true });
          result.modsPath = defaultModsPath;
        } catch (error) {
          console.warn('Could not create mods directory:', error);
        }
      }

    } catch (error) {
      console.error('Error detecting Sims 4 paths:', error);
    }

    return result;
  }

  async setSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
    this.settings[key] = value;
    await this.saveSettings();
  }

  getSetting<K extends keyof Settings>(key: K): Settings[K] {
    return this.settings[key];
  }

  async resetSettings(): Promise<Settings> {
    this.settings = { ...DEFAULT_SETTINGS };
    await this.saveSettings();
    return { ...this.settings };
  }

  async exportSettings(): Promise<string> {
    return JSON.stringify(this.settings, null, 2);
  }

  async importSettings(settingsJson: string): Promise<Settings> {
    try {
      const importedSettings = JSON.parse(settingsJson);
      this.settings = { ...DEFAULT_SETTINGS, ...importedSettings };
      await this.saveSettings();
      return { ...this.settings };
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw new Error('Invalid settings format');
    }
  }
}