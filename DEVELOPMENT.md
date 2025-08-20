# 🚀 Development Setup

This document explains how to set up and run the Sims 4 Git Mod Manager GUI application for development.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/LarryAlexander/sims4-git-mod-manager.git
cd sims4-git-mod-manager
```

2. **Install dependencies**
```bash
npm install
```

3. **Build the application**
```bash
npm run build
```

## Development

### Running in Development Mode

To start the application in development mode with hot reload:

```bash
npm run dev
```

This will start both the main process and renderer process in development mode.

### Building for Production

To build the application for production:

```bash
npm run build
npm run pack    # Create distributable package
```

## Project Structure

```
src/
├── main/              # Electron main process
│   ├── main.ts        # Main application entry point
│   └── preload.ts     # Preload script for IPC
├── renderer/          # React renderer process
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Application pages
│   │   ├── store/      # Redux store and slices
│   │   └── theme/      # Material-UI theme
│   └── index.html     # HTML entry point
├── services/          # Backend services
│   ├── ModManager.ts  # Mod scanning and management
│   ├── GitManager.ts  # Git operations
│   └── DatabaseManager.ts # SQLite database
└── types/             # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:main` - Build main process only
- `npm run build:renderer` - Build renderer process only
- `npm run lint` - Run ESLint
- `npm run pack` - Create distributable package
- `npm run dist` - Create installer package

## Phase 1 Features

The current implementation includes:

- ✅ **Modern UI**: Material-UI components with Sims 4 theming
- ✅ **Mod Management**: Scan, enable/disable .package and .ts4script files
- ✅ **Git Integration**: Automatic snapshots and rollback functionality
- ✅ **Dashboard**: Statistics and recent activity overview
- ✅ **Settings**: Configuration panel for paths and preferences

## Next Steps

Phase 2 will add:
- Profile system with Git branches
- Advanced mod conflict detection
- Enhanced search and filtering
- Drag-and-drop mod installation

## Troubleshooting

### Common Issues

1. **Build fails**: Make sure you have Node.js 18+ and all dependencies installed
2. **Electron won't start**: Try `npm run build:main` first
3. **UI doesn't load**: Check that `npm run build:renderer` completes successfully

### Development Tips

- Use `npm run dev` for hot reload during development
- Check the browser dev tools in the Electron window for debugging
- Main process logs appear in the terminal, renderer logs in dev tools