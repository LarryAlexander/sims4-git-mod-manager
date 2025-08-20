import { useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Switch,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Search as SearchIcon,
  Extension as ExtensionIcon,
  Person as PersonIcon,
  Storage as StorageIcon,
  Delete as DeleteIcon,
  Info as InfoIcon
} from '@mui/icons-material'

import { useAppDispatch, useAppSelector } from '../store'
import { 
  scanMods, 
  enableMod, 
  disableMod, 
  setSearchTerm, 
  setSelectedCategory, 
  selectFilteredMods 
} from '../store/slices/modsSlice'
import { ModCategory } from '../../../types'

function ModLibrary() {
  const dispatch = useAppDispatch()
  const { loading, error, searchTerm, selectedCategory } = useAppSelector(state => state.mods)
  const filteredMods = useAppSelector(selectFilteredMods)

  useEffect(() => {
    dispatch(scanMods())
  }, [dispatch])

  const handleToggleMod = async (modId: string, enabled: boolean) => {
    if (enabled) {
      await dispatch(disableMod(modId))
    } else {
      await dispatch(enableMod(modId))
    }
  }

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const getCategoryColor = (category: ModCategory): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (category) {
      case ModCategory.SCRIPT:
        return 'error'
      case ModCategory.GAMEPLAY:
        return 'primary'
      case ModCategory.CAS:
        return 'secondary'
      case ModCategory.BUILD_BUY:
        return 'info'
      case ModCategory.OVERRIDE:
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Mod Library
        </Typography>
        <Button
          variant="contained"
          startIcon={<ExtensionIcon />}
          onClick={() => dispatch(scanMods())}
          disabled={loading}
        >
          Scan Mods
        </Button>
      </Box>

      {/* Search and Filter Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search mods..."
                value={searchTerm}
                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => dispatch(setSelectedCategory(e.target.value as string))}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value={ModCategory.GAMEPLAY}>Gameplay</MenuItem>
                  <MenuItem value={ModCategory.CAS}>Create-a-Sim</MenuItem>
                  <MenuItem value={ModCategory.BUILD_BUY}>Build/Buy</MenuItem>
                  <MenuItem value={ModCategory.SCRIPT}>Scripts</MenuItem>
                  <MenuItem value={ModCategory.OVERRIDE}>Overrides</MenuItem>
                  <MenuItem value={ModCategory.OTHER}>Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="textSecondary">
                {filteredMods.length} of {filteredMods.length} mods shown
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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

      {/* Mod Grid */}
      <Grid container spacing={2}>
        {filteredMods.length === 0 && !loading ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <ExtensionIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No mods found
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {searchTerm || selectedCategory
                    ? 'Try adjusting your search or filter criteria'
                    : 'No mods detected in your Mods folder'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          filteredMods.map((mod) => (
            <Grid item xs={12} sm={6} lg={4} key={mod.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Mod Name and Status */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" component="h2" fontWeight="bold" sx={{ flexGrow: 1, mr: 1 }}>
                      {mod.name}
                    </Typography>
                    <Switch
                      checked={mod.enabled}
                      onChange={() => handleToggleMod(mod.id, mod.enabled)}
                      color="primary"
                      disabled={loading}
                    />
                  </Box>

                  {/* Author and Version */}
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      {mod.author}
                    </Typography>
                    <Chip label={`v${mod.version}`} size="small" variant="outlined" />
                  </Box>

                  {/* Category and File Size */}
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Chip 
                      label={mod.category.replace('_', ' ').toUpperCase()} 
                      size="small" 
                      color={getCategoryColor(mod.category)}
                    />
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <StorageIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="textSecondary">
                        {formatFileSize(mod.fileSize)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Description */}
                  {mod.description && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {mod.description.length > 120 
                        ? `${mod.description.substring(0, 120)}...`
                        : mod.description
                      }
                    </Typography>
                  )}

                  {/* File Details */}
                  <Typography variant="caption" color="textSecondary" component="div">
                    {mod.filename}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" component="div">
                    Modified: {mod.lastModified.toLocaleDateString()}
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Mod Details">
                      <IconButton size="small">
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Mod">
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color={mod.enabled ? 'success.main' : 'text.disabled'}
                    fontWeight="bold"
                  >
                    {mod.enabled ? 'ENABLED' : 'DISABLED'}
                  </Typography>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  )
}

export default ModLibrary