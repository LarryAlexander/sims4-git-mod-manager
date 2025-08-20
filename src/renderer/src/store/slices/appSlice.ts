import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { AppSettings } from '../../../../types'

interface AppState {
  settings: AppSettings
  isInitialized: boolean
  loading: boolean
  error: string | null
  sidebarOpen: boolean
  currentPage: string
}

const defaultSettings: AppSettings = {
  simsInstallPath: '',
  modsFolder: '',
  autoBackup: true,
  checkUpdates: true,
  theme: 'light',
  language: 'en'
}

const initialState: AppState = {
  settings: defaultSettings,
  isInitialized: false,
  loading: false,
  error: null,
  sidebarOpen: true,
  currentPage: 'dashboard'
}

// Async thunks
export const initializeApp = createAsyncThunk(
  'app/initialize',
  async () => {
    await window.electronAPI.db.initialize()
    return true
  }
)

export const selectModsFolder = createAsyncThunk(
  'app/selectModsFolder',
  async () => {
    const folderPath = await window.electronAPI.dialog.selectFolder()
    return folderPath
  }
)

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<Partial<AppSettings>>) => {
      state.settings = { ...state.settings, ...action.payload }
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    }
  },
  extraReducers: (builder) => {
    builder
      // Initialize app
      .addCase(initializeApp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(initializeApp.fulfilled, (state) => {
        state.loading = false
        state.isInitialized = true
      })
      .addCase(initializeApp.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to initialize app'
      })
      
      // Select mods folder
      .addCase(selectModsFolder.pending, (state) => {
        state.loading = true
      })
      .addCase(selectModsFolder.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.settings.modsFolder = action.payload
        }
      })
      .addCase(selectModsFolder.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to select folder'
      })
  }
})

export const {
  setSettings,
  setSidebarOpen,
  setCurrentPage,
  setError,
  clearError,
  toggleSidebar
} = appSlice.actions

export default appSlice.reducer