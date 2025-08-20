import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  LinearProgress,
  Alert,
  Stack,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  FolderOpen as FolderIcon,
  CloudDownload as DownloadIcon,
  History as HistoryIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { AppState, ModStats } from '../../shared/types';
import { formatFileSize } from '../../shared/utils';

interface DashboardProps {
  appState: AppState;
  onScanMods: () => Promise<void>;
}

const Dashboard: React.FC<DashboardProps> = ({ appState, onScanMods }) => {
  const [scanning, setScanning] = useState(false);
  const [stats, setStats] = useState<ModStats>({
    totalMods: 0,
    enabledMods: 0,
    disabledMods: 0,
    conflicts: 0,
    totalSize: '0 MB',
    lastUpdate: new Date(),
  });

  useEffect(() => {
    calculateStats();
  }, [appState.mods]);

  const calculateStats = () => {
    const totalMods = appState.mods.length;
    const enabledMods = appState.mods.filter(mod => mod.enabled).length;
    const disabledMods = totalMods - enabledMods;
    const totalBytes = appState.mods.reduce((sum, mod) => sum + mod.fileSize, 0);
    const conflicts = appState.mods.filter(mod => mod.conflicts && mod.conflicts.length > 0).length;

    setStats({
      totalMods,
      enabledMods,
      disabledMods,
      conflicts,
      totalSize: formatFileSize(totalBytes),
      lastUpdate: new Date(),
    });
  };

  const handleScanMods = async () => {
    setScanning(true);
    try {
      await onScanMods();
    } finally {
      setScanning(false);
    }
  };

  const handleOpenModsFolder = () => {
    if (window.electronAPI) {
      window.electronAPI.openModsFolder();
    }
  };

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'success' : 'default';
  };

  const getStatusIcon = (enabled: boolean) => {
    return enabled ? <CheckIcon /> : <CancelIcon />;
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of your Sims 4 mods and recent activity
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={scanning ? <LinearProgress sx={{ width: 20 }} /> : <RefreshIcon />}
            onClick={handleScanMods}
            disabled={scanning}
          >
            {scanning ? 'Scanning...' : 'Scan for Mods'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<FolderIcon />}
            onClick={handleOpenModsFolder}
          >
            Open Mods Folder
          </Button>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            disabled
          >
            View History
          </Button>
        </Stack>
      </Box>

      {/* Alerts */}
      {!appState.settings.modsPath && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small">
              Configure
            </Button>
          }
        >
          Mods folder not configured. Please set up your Sims 4 mods directory in Settings.
        </Alert>
      )}

      {stats.conflicts > 0 && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small">
              Review Conflicts
            </Button>
          }
        >
          {stats.conflicts} mod conflict{stats.conflicts > 1 ? 's' : ''} detected. Review your mods to prevent issues.
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Total Mods
                </Typography>
              </Box>
              <Typography variant="h3" color="primary" fontWeight="bold">
                {stats.totalMods}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Managed files
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Active Mods
                </Typography>
              </Box>
              <Typography variant="h3" color="success.main" fontWeight="bold">
                {stats.enabledMods}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Currently enabled
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CancelIcon color="disabled" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Disabled Mods
                </Typography>
              </Box>
              <Typography variant="h3" color="text.secondary" fontWeight="bold">
                {stats.disabledMods}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Currently disabled
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon color={stats.conflicts > 0 ? 'error' : 'disabled'} sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Conflicts
                </Typography>
              </Box>
              <Typography 
                variant="h3" 
                color={stats.conflicts > 0 ? 'error.main' : 'text.secondary'} 
                fontWeight="bold"
              >
                {stats.conflicts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Potential issues
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Mods Directory
              </Typography>
              <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                {appState.settings.modsPath || 'Not configured'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Size
              </Typography>
              <Typography variant="body1">
                {stats.totalSize}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Git Status
              </Typography>
              <Chip 
                label={appState.settings.autoGitCommit ? 'Auto-commit enabled' : 'Manual commits'}
                color={appState.settings.autoGitCommit ? 'success' : 'default'}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Last Scan
              </Typography>
              <Typography variant="body1">
                {stats.lastUpdate.toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Quick Mod Preview */}
      {appState.mods.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Mods
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {appState.mods.slice(0, 10).map((mod) => (
                <Chip
                  key={mod.id}
                  label={mod.name}
                  icon={getStatusIcon(mod.enabled)}
                  color={getStatusColor(mod.enabled) as any}
                  variant="outlined"
                  size="small"
                />
              ))}
              {appState.mods.length > 10 && (
                <Chip
                  label={`+${appState.mods.length - 10} more`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Dashboard;