import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Profile } from '../../../../types'

interface ProfilesState {
  profiles: Profile[]
  activeProfile: Profile | null
  loading: boolean
  error: string | null
}

const initialState: ProfilesState = {
  profiles: [],
  activeProfile: null,
  loading: false,
  error: null
}

// Async thunks would go here for profile management
// For now, we'll use basic reducers since the backend integration is Phase 2

const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    setProfiles: (state, action: PayloadAction<Profile[]>) => {
      state.profiles = action.payload
    },
    setActiveProfile: (state, action: PayloadAction<Profile | null>) => {
      state.activeProfile = action.payload
    },
    addProfile: (state, action: PayloadAction<Profile>) => {
      state.profiles.push(action.payload)
    },
    updateProfile: (state, action: PayloadAction<Profile>) => {
      const index = state.profiles.findIndex(p => p.id === action.payload.id)
      if (index !== -1) {
        state.profiles[index] = action.payload
      }
    },
    removeProfile: (state, action: PayloadAction<string>) => {
      state.profiles = state.profiles.filter(p => p.id !== action.payload)
      if (state.activeProfile?.id === action.payload) {
        state.activeProfile = null
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    }
  }
})

export const {
  setProfiles,
  setActiveProfile,
  addProfile,
  updateProfile,
  removeProfile,
  setLoading,
  setError
} = profilesSlice.actions

export default profilesSlice.reducer