import * as sqlite3 from 'sqlite3';
import { join } from 'path';
import { app } from 'electron';
import { ModFile } from '../shared/types';

export class DatabaseService {
  private db: sqlite3.Database | null = null;
  private dbPath: string;

  constructor() {
    this.dbPath = join(app.getPath('userData'), 'mods.db');
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        this.createTables()
          .then(() => resolve())
          .catch(reject);
      });
    });
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createModsTable = `
      CREATE TABLE IF NOT EXISTS mods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        fileName TEXT NOT NULL,
        path TEXT NOT NULL,
        type TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        version TEXT,
        author TEXT,
        description TEXT,
        fileSize INTEGER NOT NULL,
        dateAdded DATETIME NOT NULL,
        dateModified DATETIME NOT NULL,
        thumbnail TEXT,
        conflicts TEXT,
        dependencies TEXT
      )
    `;

    const createSettingsTable = `
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `;

    return new Promise((resolve, reject) => {
      this.db!.serialize(() => {
        this.db!.run(createModsTable, (err) => {
          if (err) {
            reject(err);
            return;
          }
        });

        this.db!.run(createSettingsTable, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    });
  }

  async saveMod(mod: ModFile): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT OR REPLACE INTO mods 
      (id, name, fileName, path, type, enabled, version, author, description, 
       fileSize, dateAdded, dateModified, thumbnail, conflicts, dependencies)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      this.db!.run(query, [
        mod.id,
        mod.name,
        mod.fileName,
        mod.path,
        mod.type,
        mod.enabled ? 1 : 0,
        mod.version,
        mod.author,
        mod.description,
        mod.fileSize,
        mod.dateAdded.toISOString(),
        mod.dateModified.toISOString(),
        mod.thumbnail,
        mod.conflicts ? JSON.stringify(mod.conflicts) : null,
        mod.dependencies ? JSON.stringify(mod.dependencies) : null,
      ], (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async getMods(): Promise<ModFile[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = 'SELECT * FROM mods ORDER BY name ASC';

    return new Promise((resolve, reject) => {
      this.db!.all(query, (err, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        const mods = rows.map((row): ModFile => ({
          id: row.id,
          name: row.name,
          fileName: row.fileName,
          path: row.path,
          type: row.type,
          enabled: row.enabled === 1,
          version: row.version,
          author: row.author,
          description: row.description,
          fileSize: row.fileSize,
          dateAdded: new Date(row.dateAdded),
          dateModified: new Date(row.dateModified),
          thumbnail: row.thumbnail,
          conflicts: row.conflicts ? JSON.parse(row.conflicts) : undefined,
          dependencies: row.dependencies ? JSON.parse(row.dependencies) : undefined,
        }));

        resolve(mods);
      });
    });
  }

  async getModById(id: string): Promise<ModFile | null> {
    if (!this.db) throw new Error('Database not initialized');

    const query = 'SELECT * FROM mods WHERE id = ?';

    return new Promise((resolve, reject) => {
      this.db!.get(query, [id], (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          resolve(null);
          return;
        }

        const mod: ModFile = {
          id: row.id,
          name: row.name,
          fileName: row.fileName,
          path: row.path,
          type: row.type,
          enabled: row.enabled === 1,
          version: row.version,
          author: row.author,
          description: row.description,
          fileSize: row.fileSize,
          dateAdded: new Date(row.dateAdded),
          dateModified: new Date(row.dateModified),
          thumbnail: row.thumbnail,
          conflicts: row.conflicts ? JSON.parse(row.conflicts) : undefined,
          dependencies: row.dependencies ? JSON.parse(row.dependencies) : undefined,
        };

        resolve(mod);
      });
    });
  }

  async deleteMod(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = 'DELETE FROM mods WHERE id = ?';

    return new Promise((resolve, reject) => {
      this.db!.run(query, [id], (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async updateModEnabled(id: string, enabled: boolean): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = 'UPDATE mods SET enabled = ? WHERE id = ?';

    return new Promise((resolve, reject) => {
      this.db!.run(query, [enabled ? 1 : 0, id], (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async close(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      this.db!.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        this.db = null;
        resolve();
      });
    });
  }
}