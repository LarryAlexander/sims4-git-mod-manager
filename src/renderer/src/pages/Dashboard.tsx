import { useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip
} from '@mui/material'
import {
  Extension as ExtensionIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'

import { useAppDispatch, useAppSelector } from '../store'
import { scanMods } from '../store/slices/modsSlice'
import { getGitHistory } from '../store/slices/gitSlice'

function Dashboard() {
  const dispatch = useAppDispatch()
  const { mods, loading: modsLoading, error: modsError } = useAppSelector(state => state.mods)
  const { commits, loading: gitLoading } = useAppSelector(state => state.git)
  const { settings } = useAppSelector(state => state.app)

  useEffect(() => {
    // Load initial data
    dispatch(scanMods())
    dispatch(getGitHistory())
  }, [dispatch])

  const enabledMods = mods.filter(mod => mod.enabled)
  const disabledMods = mods.filter(mod => !mod.enabled)
  const totalSize = mods.reduce((acc, mod) => acc + mod.fileSize, 0)
  const recentCommits = commits.slice(0, 5)

  const handleRefresh = () => {
    dispatch(scanMods())
    dispatch(getGitHistory())
  }

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={modsLoading || gitLoading}
        >
          Refresh
        </Button>
      </Box>

      {/* Error Alert */}
      {modsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {modsError}
        </Alert>
      )}

      {/* Mods Folder Configuration */}
      {!settings.modsFolder && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
            <Typography>
              Mods folder not configured. Please select your Sims 4 Mods folder in Settings.
            </Typography>
            <Button variant="outlined" size="small" href="/settings">
              Configure
            </Button>
          </Box>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ExtensionIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {mods.length}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
                    Total Mods
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {enabledMods.length}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
                    Enabled
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <WarningIcon color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {disabledMods.length}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
                    Disabled
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <HistoryIcon color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {commits.length}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
                    Snapshots
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Collection Overview
              </Typography>
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Storage Usage
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatFileSize(totalSize)}
                </Typography>
              </Box>

              {modsLoading ? (
                <LinearProgress sx={{ mb: 2 }} />
              ) : (
                <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                  <Chip 
                    label={`${enabledMods.length} Active`} 
                    color="success" 
                    size="small" 
                  />
                  <Chip 
                    label={`${disabledMods.length} Inactive`} 
                    color="default" 
                    size="small" 
                  />
                  {mods.filter(m => m.category === 'script').length > 0 && (
                    <Chip 
                      label={`${mods.filter(m => m.category === 'script').length} Scripts`} 
                      color="info" 
                      size="small" 
                    />
                  )}
                </Box>
              )}

              <Button variant="outlined" href="/mods" fullWidth>
                View All Mods
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Recent Activity
              </Typography>
              
              {gitLoading ? (
                <LinearProgress />
              ) : recentCommits.length > 0 ? (
                <Box>
                  {recentCommits.map((commit, index) => (
                    <Box key={commit.hash} mb={index < recentCommits.length - 1 ? 2 : 0}>
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        {commit.message}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {commit.date.toLocaleDateString()} at {commit.date.toLocaleTimeString()}
                      </Typography>
                    </Box>
                  ))}
                  <Button variant="outlined" href="/history" fullWidth sx={{ mt: 2 }}>
                    View Full History
                  </Button>
                </Box>
              ) : (
                <Box textAlign="center" py={4}>
                  <HistoryIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography color="textSecondary">
                    No Git history found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Install or modify mods to create snapshots
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard