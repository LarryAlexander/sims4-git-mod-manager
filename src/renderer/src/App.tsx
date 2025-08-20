import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'

import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ModLibrary from './pages/ModLibrary'
import GitHistory from './pages/GitHistory'
import Settings from './pages/Settings'

import { useAppDispatch, useAppSelector } from './store'
import { initializeApp } from './store/slices/appSlice'

function App() {
  const dispatch = useAppDispatch()
  const { isInitialized, loading, error } = useAppSelector(state => state.app)

  useEffect(() => {
    dispatch(initializeApp())
  }, [dispatch])

  if (loading && !isInitialized) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Initializing Sims 4 Git Mod Manager...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        gap={2}
      >
        <Typography variant="h4" color="error" gutterBottom>
          Initialization Error
        </Typography>
        <Typography variant="body1" color="textSecondary" textAlign="center" maxWidth="500px">
          {error}
        </Typography>
        <Typography variant="body2" color="textSecondary" textAlign="center" maxWidth="500px">
          Please check your Sims 4 installation and try restarting the application.
        </Typography>
      </Box>
    )
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mods" element={<ModLibrary />} />
          <Route path="/history" element={<GitHistory />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App