import { promises as fs } from 'fs';
import { join, basename, extname } from 'path';
import { createHash } from 'crypto';
import { ModInfo, ModCategory, ConflictReport, ModConflict, ConflictType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import Store from 'electron-store';

export class ModManager {
  private store: Store;
  private modsPath: string = '';

  constructor() {
    this.store = new Store();
    this.initializeModsPath();
  }

  private async initializeModsPath(): Promise<void> {
    // Try to detect Sims 4 installation path
    const defaultPaths = [
      join(process.env.USERPROFILE || '', 'Documents', 'Electronic Arts', 'The Sims 4', 'Mods'),
      join(process.env.USERPROFILE || '', 'OneDrive', 'Documents', 'Electronic Arts', 'The Sims 4', 'Mods')
    ];

    for (const path of defaultPaths) {
      try {
        await fs.access(path);
        this.modsPath = path;
        this.store.set('modsPath', path);
        break;
      } catch {
        // Continue to next path
      }
    }

    // If no default path found, use stored path or empty
    if (!this.modsPath) {
      this.modsPath = this.store.get('modsPath') as string || '';
    }
  }

  public async scanModsFolder(): Promise<ModInfo[]> {
    if (!this.modsPath) {
      throw new Error('Mods folder not configured. Please select your Sims 4 Mods folder.');
    }

    try {
      await fs.access(this.modsPath);
    } catch {
      throw new Error(`Mods folder not found: ${this.modsPath}`);
    }

    const mods: ModInfo[] = [];
    await this.scanDirectory(this.modsPath, mods);
    
    return mods;
  }

  private async scanDirectory(dirPath: string, mods: ModInfo[]): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          await this.scanDirectory(fullPath, mods);
        } else if (entry.isFile()) {
          const ext = extname(entry.name).toLowerCase();
          
          // Check for Sims 4 mod files
          if (ext === '.package' || ext === '.ts4script') {
            const modInfo = await this.createModInfo(fullPath);
            if (modInfo) {
              mods.push(modInfo);
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Error scanning directory ${dirPath}:`, error);
    }
  }

  private async createModInfo(filePath: string): Promise<ModInfo | null> {
    try {
      const stats = await fs.stat(filePath);
      const filename = basename(filePath);
      const isDisabled = filename.endsWith('.disabled');
      const actualFilename = isDisabled ? filename.replace('.disabled', '') : filename;
      const fileBuffer = await fs.readFile(filePath);
      const fileHash = createHash('sha256').update(fileBuffer).digest('hex');

      const modInfo: ModInfo = {
        id: uuidv4(),
        name: this.extractModName(actualFilename),
        filename: actualFilename,
        version: this.extractVersion(actualFilename) || '1.0.0',
        author: this.extractAuthor(actualFilename) || 'Unknown',
        filePath,
        fileSize: stats.size,
        fileHash,
        lastModified: stats.mtime,
        enabled: !isDisabled,
        category: this.determineCategory(actualFilename),
        conflicts: [],
        dependencies: [],
        tags: [],
        installDate: stats.birthtime || stats.mtime,
      };

      return modInfo;
    } catch (error) {
      console.warn(`Error creating mod info for ${filePath}:`, error);
      return null;
    }
  }

  private extractModName(filename: string): string {
    // Remove extension and common prefixes/suffixes
    let name = basename(filename, extname(filename));
    
    // Remove common patterns like version numbers, author names in brackets
    name = name.replace(/\[.*?\]/g, ''); // Remove [Author] patterns
    name = name.replace(/v?\d+\.?\d*\.?\d*/g, ''); // Remove version patterns
    name = name.replace(/[-_]+/g, ' '); // Replace dashes and underscores with spaces
    name = name.trim();

    return name || filename;
  }

  private extractVersion(filename: string): string | null {
    const versionMatch = filename.match(/v?(\d+\.?\d*\.?\d*)/);
    return versionMatch ? versionMatch[1] : null;
  }

  private extractAuthor(filename: string): string | null {
    const authorMatch = filename.match(/\[([^\]]+)\]/);
    return authorMatch ? authorMatch[1] : null;
  }

  private determineCategory(filename: string): ModCategory {
    const name = filename.toLowerCase();
    
    if (name.includes('script') || name.endsWith('.ts4script')) {
      return ModCategory.SCRIPT;
    } else if (name.includes('cas') || name.includes('hair') || name.includes('clothing')) {
      return ModCategory.CAS;
    } else if (name.includes('build') || name.includes('buy') || name.includes('furniture')) {
      return ModCategory.BUILD_BUY;
    } else if (name.includes('gameplay') || name.includes('trait') || name.includes('career')) {
      return ModCategory.GAMEPLAY;
    } else if (name.includes('override') || name.includes('default')) {
      return ModCategory.OVERRIDE;
    }
    
    return ModCategory.OTHER;
  }

  public async enableMod(modId: string): Promise<void> {
    const mod = await this.findModById(modId);
    if (!mod) {
      throw new Error(`Mod not found: ${modId}`);
    }

    if (mod.enabled) {
      return; // Already enabled
    }

    const disabledPath = mod.filePath;
    const enabledPath = disabledPath.replace('.disabled', '');

    try {
      await fs.rename(disabledPath, enabledPath);
      mod.enabled = true;
      mod.filePath = enabledPath;
    } catch (error) {
      throw new Error(`Failed to enable mod: ${error}`);
    }
  }

  public async disableMod(modId: string): Promise<void> {
    const mod = await this.findModById(modId);
    if (!mod) {
      throw new Error(`Mod not found: ${modId}`);
    }

    if (!mod.enabled) {
      return; // Already disabled
    }

    const enabledPath = mod.filePath;
    const disabledPath = enabledPath + '.disabled';

    try {
      await fs.rename(enabledPath, disabledPath);
      mod.enabled = false;
      mod.filePath = disabledPath;
    } catch (error) {
      throw new Error(`Failed to disable mod: ${error}`);
    }
  }

  private async findModById(modId: string): Promise<ModInfo | null> {
    const mods = await this.scanModsFolder();
    return mods.find(mod => mod.id === modId) || null;
  }

  public async checkConflicts(): Promise<ConflictReport> {
    const mods = await this.scanModsFolder();
    const enabledMods = mods.filter(mod => mod.enabled);
    const conflicts: ModConflict[] = [];

    // Check for duplicate file names (potential overrides)
    const fileNames = new Map<string, ModInfo[]>();
    enabledMods.forEach(mod => {
      const fileName = mod.filename.toLowerCase();
      if (!fileNames.has(fileName)) {
        fileNames.set(fileName, []);
      }
      fileNames.get(fileName)!.push(mod);
    });

    fileNames.forEach((modList, fileName) => {
      if (modList.length > 1) {
        conflicts.push({
          type: ConflictType.DUPLICATE_FILES,
          modIds: modList.map(mod => mod.id),
          description: `Multiple mods with same file name: ${fileName}`,
          severity: 'medium',
          autoResolvable: false
        });
      }
    });

    // Check for script conflicts (multiple .ts4script files)
    const scriptMods = enabledMods.filter(mod => mod.filename.endsWith('.ts4script'));
    if (scriptMods.length > 10) { // Arbitrary threshold
      conflicts.push({
        type: ConflictType.SCRIPT_CONFLICTS,
        modIds: scriptMods.map(mod => mod.id),
        description: `Large number of script mods may cause performance issues (${scriptMods.length} detected)`,
        severity: 'low',
        autoResolvable: false
      });
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      suggestions: this.generateSuggestions(conflicts)
    };
  }

  private generateSuggestions(conflicts: ModConflict[]): string[] {
    const suggestions: string[] = [];

    conflicts.forEach(conflict => {
      switch (conflict.type) {
        case ConflictType.DUPLICATE_FILES:
          suggestions.push('Consider keeping only one version of duplicate mods');
          break;
        case ConflictType.SCRIPT_CONFLICTS:
          suggestions.push('Try disabling some script mods to improve performance');
          break;
      }
    });

    return suggestions;
  }

  public setModsPath(path: string): void {
    this.modsPath = path;
    this.store.set('modsPath', path);
  }

  public getModsPath(): string {
    return this.modsPath;
  }
}