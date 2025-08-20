import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography,
  Badge,
  Divider
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  ViewModule as ModuleIcon,
  CloudDownload as CurseForgeIcon,
  History as HistoryIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { AppState } from '../../shared/types';

interface SidebarProps {
  currentView: AppState['currentView'];
  onViewChange: (view: AppState['currentView']) => void;
  modCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, modCount }) => {
  const menuItems = [
    { 
      id: 'dashboard' as const, 
      label: 'Dashboard', 
      icon: <DashboardIcon />,
      badge: null
    },
    { 
      id: 'library' as const, 
      label: 'Mod Library', 
      icon: <ModuleIcon />,
      badge: modCount > 0 ? modCount : null
    },
    { 
      id: 'curseforge' as const, 
      label: 'CurseForge', 
      icon: <CurseForgeIcon />,
      badge: null
    },
    { 
      id: 'history' as const, 
      label: 'History', 
      icon: <HistoryIcon />,
      badge: null
    },
  ];

  return (
    <Box
      sx={{
        width: 280,
        backgroundColor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Logo/Title Section */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          🎮 Sims 4 Manager
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Git-powered mod management
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ py: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={currentView === item.id}
                onClick={() => onViewChange(item.id)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="secondary">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: currentView === item.id ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ mx: 2, my: 1 }} />

        {/* Settings */}
        <List>
          <ListItem disablePadding>
            <ListItemButton
              selected={currentView === 'settings'}
              onClick={() => onViewChange('settings')}
              sx={{
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Settings"
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: currentView === 'settings' ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          v1.0.0 • Made with ❤️
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;