import React, { useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  History as HistoryIcon,
  Restore as RestoreIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon
} from '@mui/icons-material'

import { useAppDispatch, useAppSelector } from '../store'
import { getGitHistory, rollbackToCommit } from '../store/slices/gitSlice'

function GitHistory() {
  const dispatch = useAppDispatch()
  const { commits, loading, error } = useAppSelector(state => state.git)
  const [rollbackDialog, setRollbackDialog] = React.useState<{
    open: boolean
    commit: any
  }>({ open: false, commit: null })

  useEffect(() => {
    dispatch(getGitHistory())
  }, [dispatch])

  const handleRollbackClick = (commit: any) => {
    setRollbackDialog({ open: true, commit })
  }

  const handleRollbackConfirm = async () => {
    if (rollbackDialog.commit) {
      await dispatch(rollbackToCommit(rollbackDialog.commit.hash))
      setRollbackDialog({ open: false, commit: null })
      // Refresh history after rollback
      dispatch(getGitHistory())
    }
  }

  const handleRollbackCancel = () => {
    setRollbackDialog({ open: false, commit: null })
  }

  const formatDateTime = (date: Date): string => {
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
  }

  const getActionColor = (action: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (action.toLowerCase()) {
      case 'enabled':
        return 'success'
      case 'disabled':
        return 'warning'
      case 'added':
      case 'installed':
        return 'primary'
      case 'removed':
      case 'deleted':
        return 'error'
      case 'updated':
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Git History
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => dispatch(getGitHistory())}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          This shows the Git history of your mod changes. You can rollback to any previous state
          to undo mod installations, updates, or configuration changes.
        </Typography>
      </Alert>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <LinearProgress sx={{ mb: 3 }} />
      )}

      {/* History List */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {commits.length === 0 && !loading ? (
            <Box textAlign="center" py={6}>
              <HistoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No Git history found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Git history will appear here after you make mod changes
              </Typography>
            </Box>
          ) : (
            <List>
              {commits.map((commit, index) => (
                <ListItem
                  key={commit.hash}
                  divider={index < commits.length - 1}
                  sx={{ 
                    py: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {commit.message}
                        </Typography>
                        {commit.modChanges.length > 0 && (
                          <Box display="flex" gap={0.5} flexWrap="wrap">
                            {commit.modChanges.slice(0, 3).map((change, i) => (
                              <Chip
                                key={i}
                                label={change.action}
                                size="small"
                                color={getActionColor(change.action)}
                                sx={{ fontSize: '0.75rem', height: '20px' }}
                              />
                            ))}
                            {commit.modChanges.length > 3 && (
                              <Chip
                                label={`+${commit.modChanges.length - 3} more`}
                                size="small"
                                color="default"
                                sx={{ fontSize: '0.75rem', height: '20px' }}
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="textSecondary">
                            {formatDateTime(commit.date)}
                          </Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="textSecondary">
                            {commit.author}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="textSecondary" 
                            sx={{ 
                              fontFamily: 'monospace',
                              backgroundColor: 'rgba(0, 0, 0, 0.05)',
                              px: 1,
                              borderRadius: 1
                            }}
                          >
                            {commit.hash.substring(0, 8)}
                          </Typography>
                        </Box>

                        {/* Mod Changes Details */}
                        {commit.modChanges.length > 0 && (
                          <Box>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              Changes:
                            </Typography>
                            {commit.modChanges.map((change, i) => (
                              <Typography 
                                key={i}
                                variant="body2" 
                                color="textSecondary"
                                sx={{ ml: 2, fontSize: '0.875rem' }}
                              >
                                • {change.action} {change.modId}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRollbackClick(commit)}
                      disabled={loading}
                      color="primary"
                    >
                      <RestoreIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Rollback Confirmation Dialog */}
      <Dialog
        open={rollbackDialog.open}
        onClose={handleRollbackCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Rollback
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to rollback to this commit?
          </Typography>
          
          {rollbackDialog.commit && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {rollbackDialog.commit.message}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {formatDateTime(rollbackDialog.commit.date)}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'monospace' }}>
                {rollbackDialog.commit.hash}
              </Typography>
            </Box>
          )}
          
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              This action will restore your mods to the state they were in at this commit. 
              Any changes made after this commit will be lost. A backup will be created 
              automatically before the rollback.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRollbackCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleRollbackConfirm} 
            variant="contained" 
            color="warning"
            disabled={loading}
          >
            Rollback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default GitHistory