import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Switch, 
  FormControlLabel,
  Button,
  Grid,
  Divider,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Chip
} from '@mui/material';
import { 
  FolderOpen as FolderIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  RestoreFromTrash as ResetIcon,
  Info as InfoIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';
import { Settings as SettingsType } from '../../shared/types';

interface SettingsProps {
  settings: SettingsType;
  onSettingsUpdate: (settings: Partial<SettingsType>) => Promise<void>;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSettingsUpdate }) => {
  const [localSettings, setLocalSettings] = useState<SettingsType>(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const handleSettingChange = <K extends keyof SettingsType>(
    key: K, 
    value: SettingsType[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await onSettingsUpdate(localSettings);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAutoDetect = async () => {
    setDetecting(true);
    try {
      if (window.electronAPI) {
        const detectedPaths = await window.electronAPI.detectSimsPath();
        if (detectedPaths.modsPath) {
          handleSettingChange('modsPath', detectedPaths.modsPath);
        }
        if (detectedPaths.installPath) {
          handleSettingChange('simsInstallPath', detectedPaths.installPath);
        }
      }
    } catch (error) {
      console.error('Failed to auto-detect paths:', error);
    } finally {
      setDetecting(false);
    }
  };

  const handleResetSettings = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure your Sims 4 mod management preferences
        </Typography>
      </Box>

      {/* Save Banner */}
      {hasChanges && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Stack direction="row" spacing={1}>
              <Button 
                color="inherit" 
                size="small"
                onClick={handleResetSettings}
                startIcon={<ResetIcon />}
              >
                Reset
              </Button>
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleSaveSettings}
                disabled={saving}
                startIcon={<SaveIcon />}
              >
                Save Changes
              </Button>
            </Stack>
          }
        >
          You have unsaved changes. Don't forget to save your settings.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Game Paths */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Game Paths
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Configure the paths to your Sims 4 installation and mods directory.
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={detecting ? <RefreshIcon className="spin" /> : <RefreshIcon />}
                  onClick={handleAutoDetect}
                  disabled={detecting}
                >
                  {detecting ? 'Detecting...' : 'Auto-Detect Paths'}
                </Button>
              </Box>

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Sims 4 Installation Directory"
                  value={localSettings.simsInstallPath}
                  onChange={(e) => handleSettingChange('simsInstallPath', e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <IconButton edge="end">
                        <FolderIcon />
                      </IconButton>
                    ),
                  }}
                  helperText="Path to your Sims 4 game installation (e.g., C:\Program Files\EA Games\The Sims 4)"
                />

                <TextField
                  fullWidth
                  label="Mods Directory"
                  value={localSettings.modsPath}
                  onChange={(e) => handleSettingChange('modsPath', e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <IconButton edge="end">
                        <FolderIcon />
                      </IconButton>
                    ),
                  }}
                  helperText="Path to your mods folder (usually in Documents\Electronic Arts\The Sims 4\Mods)"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Git Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GitHubIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Git Integration
                </Typography>
              </Box>

              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.autoGitCommit}
                      onChange={(e) => handleSettingChange('autoGitCommit', e.target.checked)}
                    />
                  }
                  label="Auto-commit mod changes"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.autoBackup}
                      onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                    />
                  }
                  label="Create backup branches"
                />

                <Typography variant="body2" color="text.secondary">
                  Git integration helps you track mod changes and revert problematic updates.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Application Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application
              </Typography>

              <Stack spacing={3}>
                <FormControl size="small">
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={localSettings.theme}
                    label="Theme"
                    onChange={(e) => handleSettingChange('theme', e.target.value as 'dark' | 'light')}
                  >
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="light">Light</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={localSettings.language}
                    label="Language"
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.notifications}
                      onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    />
                  }
                  label="Enable notifications"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.checkForUpdates}
                      onChange={(e) => handleSettingChange('checkForUpdates', e.target.checked)}
                    />
                  }
                  label="Check for updates"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Scanning Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                File Scanning
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography gutterBottom>
                  Scan Interval: {localSettings.scanInterval} seconds
                </Typography>
                <Slider
                  value={localSettings.scanInterval}
                  onChange={(_, value) => handleSettingChange('scanInterval', value as number)}
                  min={10}
                  max={300}
                  step={10}
                  marks={[
                    { value: 30, label: '30s' },
                    { value: 60, label: '1m' },
                    { value: 120, label: '2m' },
                    { value: 300, label: '5m' },
                  ]}
                  sx={{ width: 300 }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary">
                How often to automatically scan for new or changed mod files.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* System Info */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Application Version
                  </Typography>
                  <Chip label="1.0.0" size="small" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Electron Version
                  </Typography>
                  <Chip label={process.versions?.electron || 'Unknown'} size="small" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Node Version
                  </Typography>
                  <Chip label={process.versions?.node || 'Unknown'} size="small" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Platform
                  </Typography>
                  <Chip label={process.platform} size="small" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Save Button */}
      <Box sx={{ position: 'sticky', bottom: 0, pt: 3, backgroundColor: 'background.default' }}>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={handleResetSettings}
            disabled={!hasChanges}
          >
            Reset Changes
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
            disabled={!hasChanges || saving}
            startIcon={<SaveIcon />}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default Settings;