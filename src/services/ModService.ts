import { readdir, stat, rename, access } from 'fs/promises';
import { join, extname, basename } from 'path';
import { existsSync } from 'fs';
import { watch } from 'chokidar';
import { ModFile } from '../shared/types';
import { DatabaseService } from './DatabaseService';
import { MOD_FILE_EXTENSIONS } from '../shared/constants';
import { generateId, getModTypeFromExtension } from '../shared/utils';

export class ModService {
  private databaseService: DatabaseService;
  private watcher: any = null;

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
  }

  async scanMods(modsPath: string): Promise<ModFile[]> {
    if (!existsSync(modsPath)) {
      throw new Error(`Mods directory does not exist: ${modsPath}`);
    }

    const foundMods: ModFile[] = [];
    
    try {
      const files = await this.scanDirectory(modsPath);
      
      for (const filePath of files) {
        try {
          const mod = await this.createModFromFile(filePath);
          if (mod) {
            await this.databaseService.saveMod(mod);
            foundMods.push(mod);
          }
        } catch (error) {
          console.warn(`Failed to process mod file ${filePath}:`, error);
        }
      }

      // Start watching for changes
      this.startWatching(modsPath);

      return foundMods;
    } catch (error) {
      console.error('Error scanning mods:', error);
      throw error;
    }
  }

  private async scanDirectory(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          const subFiles = await this.scanDirectory(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          const extension = extname(entry.name).toLowerCase();
          if (MOD_FILE_EXTENSIONS.includes(extension) || extension === '.disabled') {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to scan directory ${dirPath}:`, error);
    }
    
    return files;
  }

  private async createModFromFile(filePath: string): Promise<ModFile | null> {
    try {
      const stats = await stat(filePath);
      const fileName = basename(filePath);
      const extension = extname(fileName);
      
      // Check if file is disabled
      const isDisabled = fileName.endsWith('.disabled');
      const actualFileName = isDisabled ? fileName.replace('.disabled', '') : fileName;
      const actualExtension = isDisabled ? extname(actualFileName) : extension;
      
      if (!MOD_FILE_EXTENSIONS.includes(actualExtension.toLowerCase())) {
        return null;
      }

      const mod: ModFile = {
        id: generateId(),
        name: this.extractModName(actualFileName),
        fileName: actualFileName,
        path: filePath,
        type: getModTypeFromExtension(actualExtension),
        enabled: !isDisabled,
        fileSize: stats.size,
        dateAdded: new Date(),
        dateModified: stats.mtime,
      };

      // Try to extract additional metadata
      await this.extractModMetadata(mod);

      return mod;
    } catch (error) {
      console.error(`Failed to create mod from file ${filePath}:`, error);
      return null;
    }
  }

  private extractModName(fileName: string): string {
    // Remove extension and common prefixes/suffixes
    let name = fileName.replace(/\.(package|ts4script|cfg)$/i, '');
    
    // Remove version numbers in common formats
    name = name.replace(/[-_](v?\d+\.?\d*\.?\d*)/i, '');
    
    // Replace underscores and dashes with spaces
    name = name.replace(/[-_]/g, ' ');
    
    // Capitalize words
    name = name.replace(/\b\w/g, (char) => char.toUpperCase());
    
    return name.trim() || fileName;
  }

  private async extractModMetadata(mod: ModFile): Promise<void> {
    // TODO: Implement metadata extraction based on mod type
    // For .package files, we could parse the DBPF header
    // For .ts4script files, we could read script metadata
    // For now, just set basic info
    
    if (mod.type === 'script') {
      mod.author = 'Script Mod Author';
    }
  }

  async getMods(): Promise<ModFile[]> {
    return await this.databaseService.getMods();
  }

  async getModById(id: string): Promise<ModFile | null> {
    return await this.databaseService.getModById(id);
  }

  async toggleMod(modId: string): Promise<{ enabled: boolean; message: string }> {
    const mod = await this.databaseService.getModById(modId);
    if (!mod) {
      throw new Error('Mod not found');
    }

    const newEnabled = !mod.enabled;
    let newPath = mod.path;

    try {
      if (newEnabled) {
        // Enable mod - remove .disabled extension
        if (mod.path.endsWith('.disabled')) {
          newPath = mod.path.replace('.disabled', '');
          await rename(mod.path, newPath);
        }
      } else {
        // Disable mod - add .disabled extension
        if (!mod.path.endsWith('.disabled')) {
          newPath = mod.path + '.disabled';
          await rename(mod.path, newPath);
        }
      }

      // Update database
      await this.databaseService.updateModEnabled(modId, newEnabled);
      
      // Update the mod path in database if it changed
      if (newPath !== mod.path) {
        mod.path = newPath;
        await this.databaseService.saveMod(mod);
      }

      return {
        enabled: newEnabled,
        message: `Mod ${newEnabled ? 'enabled' : 'disabled'} successfully`,
      };
    } catch (error) {
      console.error('Error toggling mod:', error);
      throw new Error(`Failed to ${newEnabled ? 'enable' : 'disable'} mod: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteMod(modId: string): Promise<{ success: boolean; message: string }> {
    const mod = await this.databaseService.getModById(modId);
    if (!mod) {
      throw new Error('Mod not found');
    }

    try {
      // Remove from file system
      if (existsSync(mod.path)) {
        await require('fs/promises').unlink(mod.path);
      }

      // Remove from database
      await this.databaseService.deleteMod(modId);

      return {
        success: true,
        message: 'Mod deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting mod:', error);
      throw new Error(`Failed to delete mod: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async importMod(filePath: string, targetDir: string): Promise<ModFile> {
    if (!existsSync(filePath)) {
      throw new Error('Source file does not exist');
    }

    const fileName = basename(filePath);
    const targetPath = join(targetDir, fileName);

    try {
      // Copy file to mods directory
      await require('fs/promises').copyFile(filePath, targetPath);

      // Create mod entry
      const mod = await this.createModFromFile(targetPath);
      if (!mod) {
        throw new Error('Failed to create mod from imported file');
      }

      await this.databaseService.saveMod(mod);
      return mod;
    } catch (error) {
      console.error('Error importing mod:', error);
      throw new Error(`Failed to import mod: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private startWatching(modsPath: string): void {
    if (this.watcher) {
      this.watcher.close();
    }

    this.watcher = watch(modsPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
    });

    this.watcher
      .on('add', async (filePath: string) => {
        console.log('New mod file detected:', filePath);
        const mod = await this.createModFromFile(filePath);
        if (mod) {
          await this.databaseService.saveMod(mod);
        }
      })
      .on('unlink', async (filePath: string) => {
        console.log('Mod file removed:', filePath);
        // Find and remove mod from database
        const mods = await this.databaseService.getMods();
        const mod = mods.find(m => m.path === filePath);
        if (mod) {
          await this.databaseService.deleteMod(mod.id);
        }
      })
      .on('change', async (filePath: string) => {
        console.log('Mod file changed:', filePath);
        const mods = await this.databaseService.getMods();
        const mod = mods.find(m => m.path === filePath);
        if (mod) {
          const stats = await stat(filePath);
          mod.dateModified = stats.mtime;
          mod.fileSize = stats.size;
          await this.databaseService.saveMod(mod);
        }
      });
  }

  stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}