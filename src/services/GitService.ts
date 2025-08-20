import { simpleGit, SimpleGit, LogResult } from 'simple-git';
import { existsSync } from 'fs';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { GitCommit } from '../shared/types';

export class GitService {
  private git: SimpleGit | null = null;
  private repoPath: string = '';

  async initializeRepository(path: string): Promise<{ success: boolean; message: string }> {
    try {
      this.repoPath = path;
      this.git = simpleGit(path);

      // Check if it's already a git repository
      const isRepo = await this.git.checkIsRepo();
      
      if (!isRepo) {
        // Initialize new repository
        await this.git.init();
        
        // Create .gitignore for Sims 4 mods
        await this.createGitignore(path);
        
        // Initial commit
        await this.git.add('.gitignore');
        await this.git.commit('Initial commit: Add gitignore for Sims 4 mods');
        
        return {
          success: true,
          message: 'Git repository initialized successfully',
        };
      }

      return {
        success: true,
        message: 'Git repository already exists',
      };
    } catch (error) {
      console.error('Error initializing git repository:', error);
      return {
        success: false,
        message: `Failed to initialize git repository: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private async createGitignore(path: string): Promise<void> {
    const gitignoreContent = `# Sims 4 Mod Manager - Auto-generated .gitignore

# Temporary files
*.tmp
*.temp
~*

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Backup files
*.backup
*.bak
*.old

# Large cache files (keep small mod files)
*.cache
*.log

# Personal settings (if any config files are created)
settings.ini
config.ini

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Keep all mod files
!*.package
!*.ts4script
!*.cfg

# Disabled mods (commented out to track them)
# *.disabled
`;

    const gitignorePath = join(path, '.gitignore');
    await writeFile(gitignorePath, gitignoreContent);
  }

  async commitChanges(path: string, message: string): Promise<{ success: boolean; hash?: string; message: string }> {
    try {
      if (!this.git || this.repoPath !== path) {
        this.repoPath = path;
        this.git = simpleGit(path);
      }

      // Check if there are any changes to commit
      const status = await this.git.status();
      const hasChanges = status.files.length > 0;

      if (!hasChanges) {
        return {
          success: true,
          message: 'No changes to commit',
        };
      }

      // Add all changes
      await this.git.add('.');

      // Commit with message
      const commit = await this.git.commit(message);

      return {
        success: true,
        hash: commit.commit,
        message: `Committed changes: ${commit.summary.changes} files changed`,
      };
    } catch (error) {
      console.error('Error committing changes:', error);
      return {
        success: false,
        message: `Failed to commit changes: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async getHistory(path: string, limit: number = 50): Promise<GitCommit[]> {
    try {
      if (!this.git || this.repoPath !== path) {
        this.repoPath = path;
        this.git = simpleGit(path);
      }

      const log = await this.git.log({
        maxCount: limit,
      }) as LogResult;

      const commits: GitCommit[] = [];

      for (const commit of log.all) {
        // Get files changed in this commit
        const filesChanged = await this.getChangedFiles(commit.hash);

        commits.push({
          hash: (commit as any).hash,
          message: (commit as any).message,
          date: new Date((commit as any).date),
          author: `${(commit as any).author_name} <${(commit as any).author_email}>`,
          filesChanged,
        });
      }

      return commits;
    } catch (error) {
      console.error('Error getting git history:', error);
      return [];
    }
  }

  private async getChangedFiles(commitHash: string): Promise<string[]> {
    try {
      if (!this.git) return [];

      const diff = await this.git.show([
        '--name-only',
        '--pretty=format:',
        commitHash,
      ]);

      return diff
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('commit'))
        .map(line => line.trim());
    } catch (error) {
      console.warn('Error getting changed files for commit:', error);
      return [];
    }
  }

  async revertToCommit(path: string, commitHash: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.git || this.repoPath !== path) {
        this.repoPath = path;
        this.git = simpleGit(path);
      }

      // Create a backup branch first
      const backupBranch = `backup-${Date.now()}`;
      await this.git.checkoutLocalBranch(backupBranch);
      
      // Switch back to main branch
      await this.git.checkout('main');
      
      // Reset to the specified commit
      await this.git.reset(['--hard', commitHash]);

      return {
        success: true,
        message: `Reverted to commit ${commitHash.substring(0, 7)}. Backup created as ${backupBranch}`,
      };
    } catch (error) {
      console.error('Error reverting to commit:', error);
      return {
        success: false,
        message: `Failed to revert to commit: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async getCurrentBranch(path: string): Promise<string> {
    try {
      if (!this.git || this.repoPath !== path) {
        this.repoPath = path;
        this.git = simpleGit(path);
      }

      const status = await this.git.status();
      return status.current || 'main';
    } catch (error) {
      console.error('Error getting current branch:', error);
      return 'main';
    }
  }

  async createBranch(path: string, branchName: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.git || this.repoPath !== path) {
        this.repoPath = path;
        this.git = simpleGit(path);
      }

      await this.git.checkoutLocalBranch(branchName);

      return {
        success: true,
        message: `Created and switched to branch: ${branchName}`,
      };
    } catch (error) {
      console.error('Error creating branch:', error);
      return {
        success: false,
        message: `Failed to create branch: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async switchBranch(path: string, branchName: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.git || this.repoPath !== path) {
        this.repoPath = path;
        this.git = simpleGit(path);
      }

      await this.git.checkout(branchName);

      return {
        success: true,
        message: `Switched to branch: ${branchName}`,
      };
    } catch (error) {
      console.error('Error switching branch:', error);
      return {
        success: false,
        message: `Failed to switch branch: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async getBranches(path: string): Promise<string[]> {
    try {
      if (!this.git || this.repoPath !== path) {
        this.repoPath = path;
        this.git = simpleGit(path);
      }

      const branches = await this.git.branchLocal();
      return branches.all;
    } catch (error) {
      console.error('Error getting branches:', error);
      return [];
    }
  }

  async getStatus(path: string): Promise<any> {
    try {
      if (!this.git || this.repoPath !== path) {
        this.repoPath = path;
        this.git = simpleGit(path);
      }

      return await this.git.status();
    } catch (error) {
      console.error('Error getting git status:', error);
      return null;
    }
  }
}