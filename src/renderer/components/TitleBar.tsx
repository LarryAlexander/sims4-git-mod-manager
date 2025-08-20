import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Close, Minimize, CropSquare } from '@mui/icons-material';

const TitleBar: React.FC = () => {
  return (
    <Box
      sx={{
        height: 32,
        backgroundColor: '#1976d2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        WebkitAppRegion: 'drag',
        userSelect: 'none',
      }}
    >
      <Typography 
        variant="body2" 
        sx={{ 
          color: 'white', 
          fontWeight: 500,
          fontSize: '0.8rem' 
        }}
      >
        Sims 4 Mod Manager
      </Typography>
      
      <Box sx={{ display: 'flex', WebkitAppRegion: 'no-drag' }}>
        <IconButton 
          size="small" 
          sx={{ 
            color: 'white', 
            width: 24, 
            height: 24,
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <Minimize fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          sx={{ 
            color: 'white', 
            width: 24, 
            height: 24,
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <CropSquare fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          sx={{ 
            color: 'white', 
            width: 24, 
            height: 24,
            '&:hover': { backgroundColor: 'rgba(255,0,0,0.5)' }
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default TitleBar;