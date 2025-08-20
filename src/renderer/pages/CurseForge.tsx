import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Alert,
  Stack
} from '@mui/material';
import { 
  CloudDownload as DownloadIcon,
  OpenInNew as ExternalLinkIcon,
  Construction as ConstructionIcon
} from '@mui/icons-material';

const CurseForge: React.FC = () => {
  const handleOpenCurseForge = () => {
    if (window.electronAPI) {
      window.electronAPI.openExternal('https://www.curseforge.com/sims4');
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          CurseForge Integration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and install mods from the CurseForge platform
        </Typography>
      </Box>

      {/* Coming Soon Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        CurseForge integration is coming in a future update! For now, you can download mods manually 
        from CurseForge and the mod manager will automatically detect them when you scan your mods folder.
      </Alert>

      {/* Main Content */}
      <Box 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        <Card sx={{ maxWidth: 600, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <ConstructionIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
            
            <Typography variant="h5" gutterBottom fontWeight="bold">
              CurseForge Integration Coming Soon!
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              We're working on bringing you seamless CurseForge integration that will allow you to:
            </Typography>

            <Stack spacing={2} sx={{ textAlign: 'left', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'primary.main', mr: 2 }} />
                <Typography variant="body2">
                  Browse and search the entire CurseForge mod catalog
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'primary.main', mr: 2 }} />
                <Typography variant="body2">
                  One-click mod installation and updates
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'primary.main', mr: 2 }} />
                <Typography variant="body2">
                  Automatic dependency management
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'primary.main', mr: 2 }} />
                <Typography variant="body2">
                  Mod ratings and reviews integration
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'primary.main', mr: 2 }} />
                <Typography variant="body2">
                  Automatic Git commits for new installations
                </Typography>
              </Box>
            </Stack>

            <Typography variant="body2" color="text.secondary" paragraph>
              In the meantime, you can continue using CurseForge as usual. Just download your mods 
              to your mods folder and our scanner will automatically detect and manage them!
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<ExternalLinkIcon />}
                onClick={handleOpenCurseForge}
              >
                Open CurseForge
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                disabled
              >
                Browse Mods (Coming Soon)
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 3 }}>
          Want to help implement this feature? Check out our GitHub repository!
        </Typography>
      </Box>
    </Box>
  );
};

export default CurseForge;