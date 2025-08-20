import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Avatar,
  Stack,
  Tooltip
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
  MoreVert as MoreIcon,
  GetApp as DownloadIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { AppState, ModFile } from '../../shared/types';
import { formatFileSize, formatDate } from '../../shared/utils';

interface ModLibraryProps {
  appState: AppState;
  onToggleMod: (modId: string) => Promise<void>;
}

const ModLibrary: React.FC<ModLibraryProps> = ({ appState, onToggleMod }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEnabled, setFilterEnabled] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [selectedMod, setSelectedMod] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const filteredMods = useMemo(() => {
    let filtered = appState.mods;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(mod => 
        mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (mod.author && mod.author.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by enabled status
    if (filterEnabled !== 'all') {
      filtered = filtered.filter(mod => 
        filterEnabled === 'enabled' ? mod.enabled : !mod.enabled
      );
    }

    return filtered;
  }, [appState.mods, searchQuery, filterEnabled]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, modId: string) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedMod(modId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedMod(null);
  };

  const handleToggleMod = async (modId: string) => {
    try {
      await onToggleMod(modId);
    } catch (error) {
      console.error('Failed to toggle mod:', error);
    }
  };

  const getModIcon = (mod: ModFile): string => {
    switch (mod.type) {
      case 'package':
        return '📦';
      case 'script':
        return '📜';
      case 'cfg':
        return '⚙️';
      default:
        return '📄';
    }
  };

  const getStatusColor = (enabled: boolean): 'success' | 'default' => {
    return enabled ? 'success' : 'default';
  };

  const ModCard: React.FC<{ mod: ModFile }> = ({ mod }) => (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar 
            sx={{ 
              width: 32, 
              height: 32, 
              mr: 1,
              backgroundColor: mod.enabled ? 'success.main' : 'grey.500',
              fontSize: '1rem'
            }}
          >
            {getModIcon(mod)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap title={mod.name}>
              {mod.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {mod.fileName}
            </Typography>
          </Box>
          <IconButton 
            size="small"
            onClick={(e) => handleMenuOpen(e, mod.id)}
          >
            <MoreIcon />
          </IconButton>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={mod.enabled ? 'Enabled' : 'Disabled'}
            color={getStatusColor(mod.enabled)}
            size="small"
          />
          <Chip 
            label={mod.type.toUpperCase()}
            variant="outlined"
            size="small"
          />
        </Stack>

        {mod.author && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            by {mod.author}
          </Typography>
        )}

        {mod.description && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {mod.description}
          </Typography>
        )}

        <Box sx={{ mt: 'auto', pt: 1 }}>
          <Typography variant="caption" display="block" color="text.secondary">
            Size: {formatFileSize(mod.fileSize)}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            Modified: {formatDate(mod.dateModified)}
          </Typography>
        </Box>
      </CardContent>

      <CardActions>
        <FormControlLabel
          control={
            <Switch
              checked={mod.enabled}
              onChange={() => handleToggleMod(mod.id)}
              size="small"
            />
          }
          label={mod.enabled ? 'Enabled' : 'Disabled'}
          sx={{ ml: 0 }}
        />
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Show in folder">
          <IconButton size="small">
            <FolderIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Mod Library
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your Sims 4 mods collection
        </Typography>
      </Box>

      {/* Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search mods..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300, flex: 1 }}
          size="small"
        />

        <Button
          variant={filterEnabled !== 'all' ? 'contained' : 'outlined'}
          startIcon={<FilterIcon />}
          onClick={() => {
            const next = filterEnabled === 'all' ? 'enabled' 
              : filterEnabled === 'enabled' ? 'disabled' : 'all';
            setFilterEnabled(next);
          }}
          size="small"
        >
          {filterEnabled === 'all' ? 'All Mods' 
            : filterEnabled === 'enabled' ? 'Enabled' : 'Disabled'}
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={() => setViewMode('grid')}
            color={viewMode === 'grid' ? 'primary' : 'default'}
          >
            <GridIcon />
          </IconButton>
          <IconButton
            onClick={() => setViewMode('list')}
            color={viewMode === 'list' ? 'primary' : 'default'}
          >
            <ListIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Mod Count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredMods.length} of {appState.mods.length} mods
      </Typography>

      {/* Mods Grid/List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {filteredMods.length === 0 ? (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              py: 8
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {appState.mods.length === 0 ? 'No mods found' : 'No mods match your search'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {appState.mods.length === 0 
                ? 'Scan your mods folder to get started'
                : 'Try adjusting your search or filter criteria'
              }
            </Typography>
            {appState.mods.length === 0 && (
              <Button variant="contained" sx={{ mt: 2 }}>
                Scan for Mods
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredMods.map((mod) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={mod.id}>
                <ModCard mod={mod} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <InfoIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <FolderIcon sx={{ mr: 1 }} fontSize="small" />
          Show in Folder
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
          Export Mod
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete Mod
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ModLibrary;