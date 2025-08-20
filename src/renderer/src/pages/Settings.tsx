
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  Alert,
  Divider
} from '@mui/material'
import {
  Folder as FolderIcon,
  Settings as SettingsIcon,
  Save as SaveIcon
} from '@mui/icons-material'

import { useAppDispatch, useAppSelector } from '../store'
import { selectModsFolder, setSettings } from '../store/slices/appSlice'

function Settings() {
  const dispatch = useAppDispatch()
  const { settings, loading } = useAppSelector(state => state.app)

  const handleSelectModsFolder = () => {
    dispatch(selectModsFolder())
  }

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    dispatch(setSettings({ [key]: value }))
  }

  const handleSaveSettings = () => {
    // In a real app, this would save to the database
    console.log('Settings saved:', settings)
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          disabled={loading}
        >
          Save Settings
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* File Locations */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <FolderIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  File Locations
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Sims 4 Mods Folder
                  </Typography>
                  <Box display="flex" gap={1} alignItems="center">
                    <TextField
                      fullWidth
                      value={settings.modsFolder}
                      placeholder="Select your Sims 4 Mods folder..."
                      InputProps={{
                        readOnly: true,
                      }}
                      helperText="This is where your Sims 4 mods are stored"
                    />
                    <Button
                      variant="outlined"
                      onClick={handleSelectModsFolder}
                      disabled={loading}
                      sx={{ minWidth: 120 }}
                    >
                      Browse
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Sims 4 Installation Path"
                    value={settings.simsInstallPath}
                    onChange={(e) => handleSettingChange('simsInstallPath', e.target.value)}
                    placeholder="C:\\Program Files\\EA\\The Sims 4"
                    helperText="Path to your Sims 4 game installation (optional)"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Backup & Git Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <SettingsIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Backup & Git
                </Typography>
              </Box>

              <Box display="flex" flexDirection="column" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoBackup}
                      onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                    />
                  }
                  label="Automatic Backups"
                />
                <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mt: -1 }}>
                  Automatically create Git snapshots when mods are changed
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Alert severity="info">
                  <Typography variant="body2">
                    Git operations run automatically in the background to keep your mods safe.
                    All changes are tracked and can be rolled back if needed.
                  </Typography>
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Update Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Updates & Notifications
              </Typography>

              <Box display="flex" flexDirection="column" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.checkUpdates}
                      onChange={(e) => handleSettingChange('checkUpdates', e.target.checked)}
                    />
                  }
                  label="Check for Mod Updates"
                />
                <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mt: -1 }}>
                  Automatically check CurseForge for mod updates (Phase 3 feature)
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Alert severity="info">
                  <Typography variant="body2">
                    CurseForge integration will be available in Phase 3 of development.
                    This will enable automatic update checking and one-click installations.
                  </Typography>
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Application Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Application Settings
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Theme"
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark (Coming Soon)</option>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Language"
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="en">English</option>
                    <option value="es">Español (Coming Soon)</option>
                    <option value="fr">Français (Coming Soon)</option>
                    <option value="de">Deutsch (Coming Soon)</option>
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Development Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                About
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Sims 4 Git Mod Manager v0.1.0</strong>
                </Typography>
                <Typography variant="body2">
                  This is Phase 1 of the development roadmap. Currently implemented features include:
                  basic mod scanning, enable/disable functionality, Git integration, and this settings panel.
                </Typography>
              </Alert>

              <Typography variant="body2" color="textSecondary">
                <strong>Coming in Future Phases:</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary" component="ul" sx={{ pl: 2 }}>
                <li>CurseForge integration for browsing and installing mods</li>
                <li>Profile system for different mod configurations</li>
                <li>Advanced conflict detection and resolution</li>
                <li>Mod update notifications and management</li>
                <li>Dark theme and additional languages</li>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Settings