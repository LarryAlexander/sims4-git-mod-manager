import Database from 'better-sqlite3';
import { join } from 'path';
import { app } from 'electron';
import { ModInfo, Profile, GitCommit } from '../types';

export class DatabaseManager {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor() {
    this.dbPath = this.getDatabasePath();
  }

  private getDatabasePath(): string {
    const userDataPath = app.getPath('userData');
    return join(userDataPath, 'sims4-mod-manager.db');
  }

  public async initialize(): Promise<void> {
    try {
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Mods table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS mods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        filename TEXT NOT NULL,
        version TEXT NOT NULL,
        author TEXT NOT NULL,
        filePath TEXT NOT NULL,
        fileSize INTEGER NOT NULL,
        fileHash TEXT NOT NULL,
        lastModified TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        category TEXT NOT NULL,
        conflicts TEXT DEFAULT '[]',
        dependencies TEXT DEFAULT '[]',
        curseforgeId INTEGER,
        downloadUrl TEXT,
        thumbnailUrl TEXT,
        description TEXT,
        tags TEXT DEFAULT '[]',
        rating INTEGER,
        installDate TEXT NOT NULL,
        lastUsed TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Profiles table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        modIds TEXT NOT NULL DEFAULT '[]',
        gitBranch TEXT NOT NULL,
        createdDate TEXT NOT NULL,
        lastUsed TEXT NOT NULL,
        isActive INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Git commits table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS git_commits (
        hash TEXT PRIMARY KEY,
        message TEXT NOT NULL,
        date TEXT NOT NULL,
        author TEXT NOT NULL,
        modChanges TEXT DEFAULT '[]',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // App settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_mods_enabled ON mods(enabled);
      CREATE INDEX IF NOT EXISTS idx_mods_category ON mods(category);
      CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(isActive);
      CREATE INDEX IF NOT EXISTS idx_git_commits_date ON git_commits(date);
    `);

    console.log('Database tables created successfully');
  }

  // Mod operations
  public async saveMod(mod: ModInfo): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO mods (
        id, name, filename, version, author, filePath, fileSize, fileHash,
        lastModified, enabled, category, conflicts, dependencies, curseforgeId,
        downloadUrl, thumbnailUrl, description, tags, rating, installDate, lastUsed
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      mod.id,
      mod.name,
      mod.filename,
      mod.version,
      mod.author,
      mod.filePath,
      mod.fileSize,
      mod.fileHash,
      mod.lastModified.toISOString(),
      mod.enabled ? 1 : 0,
      mod.category,
      JSON.stringify(mod.conflicts),
      JSON.stringify(mod.dependencies),
      mod.curseforgeId || null,
      mod.downloadUrl || null,
      mod.thumbnailUrl || null,
      mod.description || null,
      JSON.stringify(mod.tags),
      mod.rating || null,
      mod.installDate.toISOString(),
      mod.lastUsed?.toISOString() || null
    );
  }

  public async getMod(id: string): Promise<ModInfo | null> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM mods WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return this.rowToModInfo(row);
  }

  public async getAllMods(): Promise<ModInfo[]> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM mods ORDER BY name');
    const rows = stmt.all() as any[];

    return rows.map(row => this.rowToModInfo(row));
  }

  public async getEnabledMods(): Promise<ModInfo[]> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM mods WHERE enabled = 1 ORDER BY name');
    const rows = stmt.all() as any[];

    return rows.map(row => this.rowToModInfo(row));
  }

  public async deleteMod(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('DELETE FROM mods WHERE id = ?');
    stmt.run(id);
  }

  private rowToModInfo(row: any): ModInfo {
    return {
      id: row.id,
      name: row.name,
      filename: row.filename,
      version: row.version,
      author: row.author,
      filePath: row.filePath,
      fileSize: row.fileSize,
      fileHash: row.fileHash,
      lastModified: new Date(row.lastModified),
      enabled: row.enabled === 1,
      category: row.category,
      conflicts: JSON.parse(row.conflicts || '[]'),
      dependencies: JSON.parse(row.dependencies || '[]'),
      curseforgeId: row.curseforgeId,
      downloadUrl: row.downloadUrl,
      thumbnailUrl: row.thumbnailUrl,
      description: row.description,
      tags: JSON.parse(row.tags || '[]'),
      rating: row.rating,
      installDate: new Date(row.installDate),
      lastUsed: row.lastUsed ? new Date(row.lastUsed) : undefined
    };
  }

  // Profile operations
  public async saveProfile(profile: Profile): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO profiles (
        id, name, description, modIds, gitBranch, createdDate, lastUsed, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      profile.id,
      profile.name,
      profile.description || null,
      JSON.stringify(profile.modIds),
      profile.gitBranch,
      profile.createdDate.toISOString(),
      profile.lastUsed.toISOString(),
      profile.isActive ? 1 : 0
    );
  }

  public async getProfile(id: string): Promise<Profile | null> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM profiles WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return this.rowToProfile(row);
  }

  public async getAllProfiles(): Promise<Profile[]> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM profiles ORDER BY name');
    const rows = stmt.all() as any[];

    return rows.map(row => this.rowToProfile(row));
  }

  public async getActiveProfile(): Promise<Profile | null> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM profiles WHERE isActive = 1');
    const row = stmt.get() as any;

    if (!row) return null;

    return this.rowToProfile(row);
  }

  public async setActiveProfile(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(() => {
      // Deactivate all profiles
      this.db!.prepare('UPDATE profiles SET isActive = 0').run();
      
      // Activate the specified profile
      this.db!.prepare('UPDATE profiles SET isActive = 1, lastUsed = ? WHERE id = ?')
        .run(new Date().toISOString(), id);
    });

    transaction();
  }

  public async deleteProfile(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('DELETE FROM profiles WHERE id = ?');
    stmt.run(id);
  }

  private rowToProfile(row: any): Profile {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      modIds: JSON.parse(row.modIds || '[]'),
      gitBranch: row.gitBranch,
      createdDate: new Date(row.createdDate),
      lastUsed: new Date(row.lastUsed),
      isActive: row.isActive === 1
    };
  }

  // Git commit operations
  public async saveCommit(commit: GitCommit): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO git_commits (hash, message, date, author, modChanges)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      commit.hash,
      commit.message,
      commit.date.toISOString(),
      commit.author,
      JSON.stringify(commit.modChanges)
    );
  }

  public async getCommits(limit: number = 50): Promise<GitCommit[]> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM git_commits ORDER BY date DESC LIMIT ?');
    const rows = stmt.all(limit) as any[];

    return rows.map(row => ({
      hash: row.hash,
      message: row.message,
      date: new Date(row.date),
      author: row.author,
      modChanges: JSON.parse(row.modChanges || '[]')
    }));
  }

  // Settings operations
  public async setSetting(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO app_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(key, JSON.stringify(value));
  }

  public async getSetting(key: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT value FROM app_settings WHERE key = ?');
    const row = stmt.get(key) as any;

    if (!row) return null;

    try {
      return JSON.parse(row.value);
    } catch {
      return row.value;
    }
  }

  public async getAllSettings(): Promise<Record<string, any>> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT key, value FROM app_settings');
    const rows = stmt.all() as any[];

    const settings: Record<string, any> = {};
    
    rows.forEach(row => {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    });

    return settings;
  }

  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}