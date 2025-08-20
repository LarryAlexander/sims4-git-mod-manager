import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ModInfo, ConflictReport } from '../../../../types'

interface ModsState {
  mods: ModInfo[]
  loading: boolean
  error: string | null
  conflicts: ConflictReport | null
  searchTerm: string
  selectedCategory: string
  sortBy: 'name' | 'date' | 'size'
  sortOrder: 'asc' | 'desc'
}

const initialState: ModsState = {
  mods: [],
  loading: false,
  error: null,
  conflicts: null,
  searchTerm: '',
  selectedCategory: '',
  sortBy: 'name',
  sortOrder: 'asc'
}

// Async thunks for interacting with the main process
export const scanMods = createAsyncThunk(
  'mods/scan',
  async () => {
    const mods = await window.electronAPI.mod.scan()
    return mods as ModInfo[]
  }
)

export const enableMod = createAsyncThunk(
  'mods/enable',
  async (modId: string) => {
    await window.electronAPI.mod.enable(modId)
    return modId
  }
)

export const disableMod = createAsyncThunk(
  'mods/disable',
  async (modId: string) => {
    await window.electronAPI.mod.disable(modId)
    return modId
  }
)

const modsSlice = createSlice({
  name: 'mods',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload
    },
    setSortBy: (state, action: PayloadAction<'name' | 'date' | 'size'>) => {
      state.sortBy = action.payload
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    updateModInState: (state, action: PayloadAction<Partial<ModInfo> & { id: string }>) => {
      const index = state.mods.findIndex(mod => mod.id === action.payload.id)
      if (index !== -1) {
        state.mods[index] = { ...state.mods[index], ...action.payload }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Scan mods
      .addCase(scanMods.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(scanMods.fulfilled, (state, action) => {
        state.loading = false
        state.mods = action.payload
      })
      .addCase(scanMods.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to scan mods'
      })
      
      // Enable mod
      .addCase(enableMod.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(enableMod.fulfilled, (state, action) => {
        state.loading = false
        const mod = state.mods.find(m => m.id === action.payload)
        if (mod) {
          mod.enabled = true
          mod.lastUsed = new Date()
        }
      })
      .addCase(enableMod.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to enable mod'
      })
      
      // Disable mod
      .addCase(disableMod.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(disableMod.fulfilled, (state, action) => {
        state.loading = false
        const mod = state.mods.find(m => m.id === action.payload)
        if (mod) {
          mod.enabled = false
        }
      })
      .addCase(disableMod.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to disable mod'
      })
  }
})

export const {
  setSearchTerm,
  setSelectedCategory,
  setSortBy,
  setSortOrder,
  clearError,
  updateModInState
} = modsSlice.actions

export default modsSlice.reducer

// Selectors
export const selectFilteredMods = (state: { mods: ModsState }) => {
  const { mods, searchTerm, selectedCategory, sortBy, sortOrder } = state.mods

  let filtered = mods.filter(mod => {
    const matchesSearch = !searchTerm || 
      mod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mod.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mod.filename.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !selectedCategory || mod.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Sort the filtered mods
  filtered.sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'date':
        aValue = a.lastModified.getTime()
        bValue = b.lastModified.getTime()
        break
      case 'size':
        aValue = a.fileSize
        bValue = b.fileSize
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  return filtered
}