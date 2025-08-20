// Core mod information interface
export interface ModInfo {
  // Core Identity
  id: string;                    // UUID for internal tracking
  name: string;                  // Display name
  filename: string;              // Actual file name
  version: string;               // Version string
  author: string;                // Creator name
  
  // File Information
  filePath: string;              // Full path to mod file
  fileSize: number;              // File size in bytes
  fileHash: string;              // SHA256 hash for integrity
  lastModified: Date;            // File modification date
  
  // Status Information
  enabled: boolean;              // Currently active
  category: ModCategory;         // Mod type/category
  conflicts: string[];           // IDs of conflicting mods
  dependencies: string[];        // Required mod dependencies
  
  // CurseForge Integration
  curseforgeId?: number;         // CurseForge project ID
  downloadUrl?: string;          // Download URL
  thumbnailUrl?: string;         // Preview image
  
  // User Experience
  description?: string;          // Mod description
  tags: string[];               // User-defined tags
  rating?: number;              // User rating (1-5)
  installDate: Date;            // When it was installed
  lastUsed?: Date;              // Last time it was enabled
}

// Mod categories for organization
export enum ModCategory {
  GAMEPLAY = 'gameplay',
  CAS = 'cas', // Create-a-Sim
  BUILD_BUY = 'build_buy',
  SCRIPT = 'script',
  OVERRIDE = 'override',
  OTHER = 'other'
}

// Profile information for different mod setups
export interface Profile {
  id: string;                   // Profile UUID
  name: string;                 // Display name
  description?: string;         // Profile description
  modIds: string[];            // List of enabled mod IDs
  gitBranch: string;           // Associated Git branch
  createdDate: Date;           // When profile was created
  lastUsed: Date;              // Last time profile was active
  isActive: boolean;           // Currently active profile
}

// Git commit information
export interface GitCommit {
  hash: string;                // Commit hash
  message: string;             // Commit message
  date: Date;                  // Commit date
  author: string;              // Committer
  modChanges: ModChange[];     // What mods changed
}

// Individual mod changes in commits
export interface ModChange {
  modId: string;               // Which mod
  action: 'added' | 'removed' | 'enabled' | 'disabled' | 'updated';
  previousState?: any;         // Previous state for rollback
}

// Conflict detection information
export interface ConflictReport {
  hasConflicts: boolean;       // Are there any conflicts
  conflicts: ModConflict[];    // List of conflicts
  suggestions: string[];       // Resolution suggestions
}

export interface ModConflict {
  type: ConflictType;          // Type of conflict
  modIds: string[];           // Conflicting mods
  description: string;         // Human-readable description
  severity: 'low' | 'medium' | 'high';
  autoResolvable: boolean;     // Can be auto-resolved
}

export enum ConflictType {
  DUPLICATE_FILES = 'duplicate_files',
  INCOMPATIBLE_VERSIONS = 'incompatible_versions',
  MISSING_DEPENDENCIES = 'missing_dependencies',
  SCRIPT_CONFLICTS = 'script_conflicts'
}

// Application state interfaces
export interface AppState {
  mods: ModInfo[];
  profiles: Profile[];
  currentProfile: Profile | null;
  gitHistory: GitCommit[];
  conflicts: ConflictReport;
  settings: AppSettings;
  loading: boolean;
  error: string | null;
}

export interface AppSettings {
  simsInstallPath: string;     // Path to The Sims 4 installation
  modsFolder: string;          // Path to Mods folder
  autoBackup: boolean;         // Auto-create Git snapshots
  checkUpdates: boolean;       // Check for mod updates
  theme: 'light' | 'dark';     // UI theme
  language: string;            // UI language
}

// CurseForge API interfaces
export interface CurseForgeProject {
  id: number;
  name: string;
  slug: string;
  summary: string;
  downloadCount: number;
  categories: CurseForgeCategory[];
  authors: CurseForgeAuthor[];
  logo: CurseForgeLogo;
  screenshots: CurseForgeScreenshot[];
  dateModified: string;
  gamePopularityRank: number;
}

export interface CurseForgeCategory {
  id: number;
  name: string;
  slug: string;
}

export interface CurseForgeAuthor {
  id: number;
  name: string;
  url: string;
}

export interface CurseForgeLogo {
  id: number;
  modId: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  url: string;
}

export interface CurseForgeScreenshot {
  id: number;
  modId: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  url: string;
}

// UI Component Props
export interface ModCardProps {
  mod: ModInfo;
  onToggle: (modId: string) => void;
  onDetails: (modId: string) => void;
  onDelete: (modId: string) => void;
}

export interface ProfileSelectorProps {
  profiles: Profile[];
  activeProfile: Profile | null;
  onProfileChange: (profileId: string) => void;
  onCreateProfile: () => void;
}

export interface GitHistoryProps {
  commits: GitCommit[];
  onRollback: (commitHash: string) => void;
}