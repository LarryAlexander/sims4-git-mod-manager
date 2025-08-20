import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Button,
  Stack,
  Alert,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  History as HistoryIcon,
  Commit as CommitIcon,
  RestoreFromTrash as RevertIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  AccountTree as BranchIcon
} from '@mui/icons-material';
import { GitCommit } from '../../shared/types';
import { formatDate } from '../../shared/utils';

const History: React.FC = () => {
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      if (window.electronAPI) {
        const history = await window.electronAPI.getHistory();
        setCommits(history || []);
      }
    } catch (err) {
      console.error('Failed to load git history:', err);
      setError('Failed to load Git history. Make sure Git is initialized.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (commitHash: string) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.revertCommit(commitHash);
        await loadHistory(); // Reload history
      }
    } catch (error) {
      console.error('Failed to revert commit:', error);
      setError('Failed to revert commit. Please try again.');
    }
  };

  const initializeGit = async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.initGit();
        await loadHistory();
      }
    } catch (error) {
      console.error('Failed to initialize Git:', error);
      setError('Failed to initialize Git repository.');
    }
  };

  const filteredCommits = commits.filter(commit =>
    !searchQuery || 
    commit.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    commit.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCommitTypeIcon = (message: string) => {
    if (message.toLowerCase().includes('enabled') || message.toLowerCase().includes('disabled')) {
      return '🔄';
    } else if (message.toLowerCase().includes('added') || message.toLowerCase().includes('install')) {
      return '➕';
    } else if (message.toLowerCase().includes('removed') || message.toLowerCase().includes('delete')) {
      return '➖';
    } else if (message.toLowerCase().includes('initial')) {
      return '🎉';
    }
    return '📝';
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>Loading history...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track changes to your mod collection with Git version control
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={initializeGit}>
              Initialize Git
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search commits..."
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
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadHistory}
        >
          Refresh
        </Button>

        <Button
          variant="outlined"
          startIcon={<BranchIcon />}
          disabled
        >
          Branches
        </Button>
      </Box>

      {/* History List */}
      <Card sx={{ flex: 1, overflow: 'auto' }}>
        {filteredCommits.length === 0 ? (
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No commit history found
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {commits.length === 0 
                  ? "Start managing your mods to see commit history here."
                  : "No commits match your search criteria."
                }
              </Typography>
              {commits.length === 0 && !error && (
                <Button variant="contained" onClick={initializeGit}>
                  Initialize Git Repository
                </Button>
              )}
            </Box>
          </CardContent>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredCommits.map((commit, index) => (
              <ListItem 
                key={commit.hash}
                sx={{ 
                  borderBottom: index < filteredCommits.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  py: 2
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ backgroundColor: 'primary.main' }}>
                    {getCommitTypeIcon(commit.message)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" component="span">
                        {commit.message}
                      </Typography>
                      <Chip 
                        label={commit.hash.substring(0, 7)} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" component="div">
                        {commit.author} • {formatDate(commit.date)}
                      </Typography>
                      {commit.filesChanged.length > 0 && (
                        <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
                          Files changed: {commit.filesChanged.slice(0, 3).join(', ')}
                          {commit.filesChanged.length > 3 && ` +${commit.filesChanged.length - 3} more`}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Revert to this commit">
                    <IconButton 
                      size="small"
                      onClick={() => handleRevert(commit.hash)}
                      color="warning"
                    >
                      <RevertIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View commit details">
                    <IconButton size="small" disabled>
                      <CommitIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </ListItem>
            ))}
          </List>
        )}
      </Card>
    </Box>
  );
};

export default History;