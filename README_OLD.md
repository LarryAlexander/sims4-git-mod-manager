#  Sims 4 Mod Management with Git + CurseForge

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows-blue.svg)](https://www.microsoft.com/en-us/windows)
[![Game: The Sims 4](https://img.shields.io/badge/Game-The%20Sims%204-green.svg)](https://www.ea.com/games/the-sims/the-sims-4)

**Revolutionary mod management combining CurseForge convenience with Git version control**

>  **Experimental Project**: This is a proof-of-concept for using Git to manage Sims 4 mods alongside CurseForge. Use at your own risk!

##  Why This Exists

Traditional Sims 4 modding suffers from:
-  Mod conflicts breaking saves
-  No easy rollback when updates fail  
-  Losing working configurations
-  Manual conflict resolution
-  No sharing of stable setups

**This project solves ALL of these problems.**

##  Features

-  **Version Control**: Track every mod change with Git
-  **CurseForge Integration**: Use CurseForge normally, Git handles the rest
-  **Branch Management**: Test risky mods without breaking your main setup
-  **Exception Analysis**: Track and resolve mod conflicts systematically
-  **Easy Rollbacks**: One command to restore any previous working state
-  **Configuration Sharing**: Share working mod combinations with others

##  Quick Start

1. **Install Git**: `winget install Git.Git`
2. **Navigate to Sims 4 folder**: `cd "Documents\Electronic Arts\The Sims 4"`
3. **Clone this repo** OR **initialize your own**:
   ```powershell
   git init
   # Copy our .gitignore and scripts
   ```
4. **Install mods via CurseForge** as usual
5. **Track changes**: `./git-helper.ps1`

##  Repository Structure

```
📁 Sims 4/
  📁 Mods/                   # Your CurseForge-managed mods (TRACKED)
  📁 saves/                  # Personal saves (IGNORED)
  📁 Screenshots/            # Personal screenshots (IGNORED) 
  📄 .gitignore             # Smart filtering rules
  📄 git-helper.ps1         # Easy Git operations
  📄 upload-to-github.ps1   # GitHub setup
```

##  🚀 Advanced Usage

### Branch Strategies

```powershell
# Stable configuration
git checkout main

# Experimental mods
git checkout -b experimental

# Minimal setup for testing
git checkout -b minimal
```

### Exception Tracking
When Sims 4 crashes, your `lastException.txt` files are tracked:

```powershell
git log --oneline --grep="Exception"
git show [commit] -- lastException*.txt
```

### Mod Conflict Resolution

```powershell
# Before installing conflicting mods
git branch backup-working-config

# Test installation
git add . && git commit -m "Added potentially conflicting mod"

# If issues occur
git reset --hard backup-working-config
```

##  🎯 Real-World Scenarios

### "My game broke after updating mods"
```powershell
./git-helper.ps1
# Choose option 3: Revert changes
```

### "I want to test this mod without breaking my setup"
```powershell
git checkout -b test-new-mod
# Install mod via CurseForge
./git-helper.ps1
# Test in game, then:
git checkout main  # Go back to stable
```

### "Share my working mod combo with friends"
```powershell
git push origin my-working-setup
# Share repository URL
```

##  📁 What Gets Tracked?

✅ **TRACKED** (Version Controlled)
- All mod files in `/Mods/`
- Configuration files (Options.ini, etc.)
- Exception logs (for debugging)
- Custom content and scripts

❌ **IGNORED** (Personal Data)
- Save files
- Screenshots  
- Cache files
- Personal settings
- Large databases

##  🔧 Troubleshooting

### Git not found?
```powershell
winget install Git.Git
# Restart PowerShell
```

### Repository too large?
Check our `.gitignore` - it excludes large files automatically.

### Merge conflicts?
```powershell
git status  # See conflicted files
# Edit files to resolve
git add . && git commit
```

##  🤝 Contributing

This is an experimental project! Please:
1. 🌟 Star this repository if it helps you
2. 🐛 Report issues you encounter
3. 💡 Suggest improvements
4. 🔀 Fork and improve the scripts

##  ⚠️ Important Disclaimers

- **Experimental**: This system is new and may have bugs
- **Backup First**: Always backup your saves before major changes
- **Mod Licenses**: Respect individual mod creators' licenses
- **EA/Maxis**: We're not affiliated with EA or The Sims 4 team
- **CurseForge**: This integrates WITH CurseForge, doesn't replace it

##  📞 Support

- 📋 [Create an Issue](https://github.com/LarryAlexander/sims4-git-mod-manager/issues)
- 💬 [Discussions](https://github.com/LarryAlexander/sims4-git-mod-manager/discussions)
- 📖 [Wiki](https://github.com/LarryAlexander/sims4-git-mod-manager/wiki) (Coming Soon)

---

**Made with ❤️ by Simmers, for Simmers**

*"Finally, mod management that doesn't make me rage quit!"*