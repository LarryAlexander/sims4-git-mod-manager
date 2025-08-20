import simpleGit, { SimpleGit } from 'simple-git';
import { GitCommit, ModChange } from '../types';
import Store from 'electron-store';
import { join } from 'path';

export class GitManager {
  private git: SimpleGit;
  private store: Store;
  private repoPath: string;

  constructor() {
    this.store = new Store();
    this.repoPath = this.getRepoPath();
    this.git = simpleGit(this.repoPath);
    this.initializeRepository();
  }

  private getRepoPath(): string {
    // Use the mods folder as the repository root
    const modsPath = this.store.get('modsPath') as string;
    if (modsPath) {
      return modsPath;
    }
    
    // Fallback to a default location
    return join(process.env.USERPROFILE || '', 'Documents', 'Electronic Arts', 'The Sims 4', 'Mods');
  }

  private async initializeRepository(): Promise<void> {
    try {
      // Check if already a git repository
      const isRepo = await this.git.checkIsRepo();
      
      if (!isRepo) {
        // Initialize new repository
        await this.git.init();
        
        // Create initial .gitignore for Sims 4 specific files
        await this.createGitignore();
        
        // Create initial commit
        await this.git.add('.');
        await this.git.commit('Initial commit - Sims 4 Mod Manager setup');
      }

      // Configure Git user if not already configured
      await this.ensureGitConfig();
    } catch (error) {
      console.warn('Git initialization warning:', error);
      // Continue even if Git setup fails - some features will be unavailable
    }
  }

  private async createGitignore(): Promise<void> {
    const gitignoreContent = `
# Sims 4 Cache Files
cachestr/
onlinethumbnailcache/
localsimtexturecache.package
localthumbcache.package

# Log Files
*.log
Config.log
ReticulatedSplinesView

# Exception Reports
lastException*.txt
mc_lastexception.html
BE-ExceptionReport*.html

# Database Files
clientDB.package
avatarcache.package
accountDataDB.package

# Personal Data
saves/
*.save
*.backup
Screenshots/
Tray/
Options.ini
UserSetting.ini

# System Files
Thumbs.db
.DS_Store

# Mod Manager Files
.mod-manager/
`.trim();

    const gitignorePath = join(this.repoPath, '.gitignore');
    const fs = require('fs').promises;
    
    try {
      await fs.writeFile(gitignorePath, gitignoreContent);
    } catch (error) {
      console.warn('Could not create .gitignore:', error);
    }
  }

  private async ensureGitConfig(): Promise<void> {
    try {
      // Check if user.name is configured
      let userName = await this.git.raw(['config', '--get', 'user.name']).catch(() => '');
      if (!userName.trim()) {
        await this.git.addConfig('user.name', 'Sims 4 Mod Manager');
      }

      // Check if user.email is configured
      let userEmail = await this.git.raw(['config', '--get', 'user.email']).catch(() => '');
      if (!userEmail.trim()) {
        await this.git.addConfig('user.email', 'sims4-mod-manager@local');
      }
    } catch (error) {
      console.warn('Git config warning:', error);
    }
  }

  public async createSnapshot(message: string): Promise<string> {
    try {
      // Add all changes to staging
      await this.git.add('.');
      
      // Check if there are any changes to commit
      const status = await this.git.status();
      if (status.files.length === 0) {
        console.log('No changes to commit');
        return '';
      }

      // Create commit with message
      const commit = await this.git.commit(message);
      
      return commit.commit;
    } catch (error) {
      console.error('Error creating Git snapshot:', error);
      throw new Error(`Failed to create Git snapshot: ${error}`);
    }
  }

  public async getHistory(maxCount: number = 50): Promise<GitCommit[]> {
    try {
      const log = await this.git.log({ maxCount });
      
      return log.all.map(commit => ({
        hash: commit.hash,
        message: commit.message,
        date: new Date(commit.date),
        author: commit.author_name,
        modChanges: this.parseModChanges(commit.message)
      }));
    } catch (error) {
      console.warn('Error getting Git history:', error);
      return [];
    }
  }

  private parseModChanges(message: string): ModChange[] {
    // Simple parsing of commit messages to extract mod changes
    const changes: ModChange[] = [];
    
    if (message.toLowerCase().includes('enabled')) {
      const modName = this.extractModNameFromMessage(message);
      if (modName) {
        changes.push({
          modId: modName,
          action: 'enabled'
        });
      }
    } else if (message.toLowerCase().includes('disabled')) {
      const modName = this.extractModNameFromMessage(message);
      if (modName) {
        changes.push({
          modId: modName,
          action: 'disabled'
        });
      }
    } else if (message.toLowerCase().includes('added') || message.toLowerCase().includes('installed')) {
      const modName = this.extractModNameFromMessage(message);
      if (modName) {
        changes.push({
          modId: modName,
          action: 'added'
        });
      }
    } else if (message.toLowerCase().includes('removed') || message.toLowerCase().includes('deleted')) {
      const modName = this.extractModNameFromMessage(message);
      if (modName) {
        changes.push({
          modId: modName,
          action: 'removed'
        });
      }
    }
    
    return changes;
  }

  private extractModNameFromMessage(message: string): string | null {
    // Try to extract mod name from commit messages like "Enabled mod: ModName"
    const patterns = [
      /(?:enabled|disabled|added|removed|installed|deleted)\s+mod:?\s+(.+)/i,
      /(?:enabled|disabled|added|removed|installed|deleted)\s+(.+)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  }

  public async rollbackToCommit(commitHash: string): Promise<void> {
    try {
      // Validate commit hash exists
      const commit = await this.git.show([commitHash, '--stat']);
      if (!commit) {
        throw new Error(`Commit ${commitHash} not found`);
      }

      // Create a backup branch before rollback
      const backupBranchName = `backup-${Date.now()}`;
      await this.git.checkoutLocalBranch(backupBranchName);
      
      // Switch back to main branch
      await this.git.checkout('main').catch(() => {
        // If main doesn't exist, try master
        return this.git.checkout('master');
      });

      // Perform hard reset to the specified commit
      await this.git.reset(['--hard', commitHash]);
      
      console.log(`Successfully rolled back to commit ${commitHash}`);
    } catch (error) {
      console.error('Error rolling back:', error);
      throw new Error(`Failed to rollback to commit ${commitHash}: ${error}`);
    }
  }

  public async createBranch(name: string): Promise<void> {
    try {
      await this.git.checkoutLocalBranch(name);
    } catch (error) {
      throw new Error(`Failed to create branch ${name}: ${error}`);
    }
  }

  public async switchBranch(name: string): Promise<void> {
    try {
      await this.git.checkout(name);
    } catch (error) {
      throw new Error(`Failed to switch to branch ${name}: ${error}`);
    }
  }

  public async getCurrentBranch(): Promise<string> {
    try {
      const status = await this.git.status();
      return status.current || 'unknown';
    } catch (error) {
      console.warn('Error getting current branch:', error);
      return 'unknown';
    }
  }

  public async getBranches(): Promise<string[]> {
    try {
      const branches = await this.git.branchLocal();
      return branches.all;
    } catch (error) {
      console.warn('Error getting branches:', error);
      return [];
    }
  }

  public async getStatus(): Promise<any> {
    try {
      return await this.git.status();
    } catch (error) {
      console.warn('Error getting Git status:', error);
      return null;
    }
  }

  public setRepositoryPath(path: string): void {
    this.repoPath = path;
    this.git = simpleGit(path);
    this.store.set('modsPath', path);
  }

  public getRepositoryPath(): string {
    return this.repoPath;
  }
}