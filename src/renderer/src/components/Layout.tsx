import React from 'react'
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Extension as ExtensionIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Gamepad as GamepadIcon
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../store'
import { toggleSidebar } from '../store/slices/appSlice'

interface LayoutProps {
  children: React.ReactNode
}

const drawerWidth = 280

const navigationItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Mod Library', icon: <ExtensionIcon />, path: '/mods' },
  { text: 'Git History', icon: <HistoryIcon />, path: '/history' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
]

function Layout({ children }: LayoutProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { sidebarOpen } = useAppSelector(state => state.app)

  const handleDrawerToggle = () => {
    dispatch(toggleSidebar())
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    if (isMobile) {
      dispatch(toggleSidebar())
    }
  }

  const drawerContent = (
    <Box sx={{ overflow: 'auto', height: '100%' }}>
      {/* App Header in Drawer */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.primary.light}20)`
        }}
      >
        <GamepadIcon color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6" color="primary" fontWeight="bold">
            Sims 4
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Mod Manager
          </Typography>
        </Box>
      </Box>

      {/* Navigation List */}
      <List sx={{ pt: 2 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: `${theme.palette.primary.main}15`,
                  '&:hover': {
                    backgroundColor: `${theme.palette.primary.main}25`,
                  }
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                minWidth: 40
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                    fontWeight: location.pathname === item.path ? 600 : 400
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)` },
          ml: { md: sidebarOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          })
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" fontWeight="bold">
            {navigationItems.find(item => item.path === location.pathname)?.text || 'Sims 4 Git Mod Manager'}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: sidebarOpen ? drawerWidth : 0 }, flexShrink: { md: 0 } }}
        aria-label="navigation"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={sidebarOpen && isMobile}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth 
            },
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="persistent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: '4px 0 8px rgba(0,0,0,0.1)'
            },
          }}
          open={sidebarOpen && !isMobile}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${sidebarOpen && !isMobile ? drawerWidth : 0}px)` },
          mt: '64px', // Account for AppBar height
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          })
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default Layout