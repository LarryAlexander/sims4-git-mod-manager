import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ModLibrary from './pages/ModLibrary';
import CurseForge from './pages/CurseForge';
import History from './pages/History';
import Settings from './pages/Settings';
import TitleBar from './components/TitleBar';
import LoadingScreen from './components/LoadingScreen';
import { AppState, Settings as SettingsType } from '../shared/types';
import { DEFAULT_SETTINGS } from '../shared/constants';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00b4d8',
      light: '#48cae4',
      dark: '#0077b6',
    },
    secondary: {
      main: '#7209b7',
      light: '#a663cc',
      dark: '#480ca8',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    surface: {
      main: '#2a2a2a',
    },
  } as any,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#444 #1a1a1a',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: '#1a1a1a',
            width: 8,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#444',
            minHeight: 24,
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#666',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
        },
      },
    },
  },
});

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    mods: [],
    categories: [],
    settings: DEFAULT_SETTINGS,
    loading: true,
    currentView: 'dashboard',
  });

  useEffect(() => {
    initializeApp();
    
    // Setup menu action listeners
    if (window.electronAPI) {
      window.electronAPI.onMenuAction((action) => {
        if (action === 'scan-mods') {
          handleScanMods();
        }
      });
    }

    // Cleanup listeners on unmount
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners();
      }
    };
  }, []);

  const initializeApp = async () => {
    try {
      setAppState(prev => ({ ...prev, loading: true }));
      
      // Load settings
      const settings = await window.electronAPI.getSettings();
      setAppState(prev => ({ ...prev, settings }));
      
      // Load mods if mods path is configured
      if (settings.modsPath) {
        await loadMods();
      }
      
      setAppState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setAppState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to initialize application' 
      }));
    }
  };

  const loadMods = async () => {
    try {
      const mods = await window.electronAPI.getMods();
      setAppState(prev => ({ ...prev, mods }));
    } catch (error) {
      console.error('Failed to load mods:', error);
    }
  };

  const handleScanMods = async () => {
    try {
      setAppState(prev => ({ ...prev, loading: true }));
      const mods = await window.electronAPI.scanMods();
      setAppState(prev => ({ ...prev, mods, loading: false }));
    } catch (error) {
      console.error('Failed to scan mods:', error);
      setAppState(prev => ({ 
        ...prev, 
        loading: false,
        error: 'Failed to scan mods' 
      }));
    }
  };

  const handleToggleMod = async (modId: string) => {
    try {
      const result = await window.electronAPI.toggleMod(modId);
      
      // Update the mod in the state
      setAppState(prev => ({
        ...prev,
        mods: prev.mods.map(mod => 
          mod.id === modId ? { ...mod, enabled: result.enabled } : mod
        ),
      }));
    } catch (error) {
      console.error('Failed to toggle mod:', error);
      setAppState(prev => ({ 
        ...prev, 
        error: 'Failed to toggle mod' 
      }));
    }
  };

  const handleViewChange = (view: AppState['currentView']) => {
    setAppState(prev => ({ ...prev, currentView: view }));
  };

  const handleSettingsUpdate = async (newSettings: Partial<SettingsType>) => {
    try {
      const updatedSettings = await window.electronAPI.updateSettings(newSettings);
      setAppState(prev => ({ ...prev, settings: updatedSettings }));
      
      // If mods path changed, reload mods
      if (newSettings.modsPath) {
        await loadMods();
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const renderCurrentView = () => {
    switch (appState.currentView) {
      case 'dashboard':
        return <Dashboard appState={appState} onScanMods={handleScanMods} />;
      case 'library':
        return <ModLibrary appState={appState} onToggleMod={handleToggleMod} />;
      case 'curseforge':
        return <CurseForge />;
      case 'history':
        return <History />;
      case 'settings':
        return <Settings settings={appState.settings} onSettingsUpdate={handleSettingsUpdate} />;
      default:
        return <Dashboard appState={appState} onScanMods={handleScanMods} />;
    }
  };

  if (appState.loading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
        <TitleBar />
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar 
            currentView={appState.currentView} 
            onViewChange={handleViewChange}
            modCount={appState.mods.length}
          />
          <Box 
            component="main" 
            sx={{ 
              flex: 1, 
              overflow: 'auto',
              backgroundColor: 'background.default',
            }}
          >
            {renderCurrentView()}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;