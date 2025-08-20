import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { GitCommit } from '../../../../types'

interface GitState {
  commits: GitCommit[]
  loading: boolean
  error: string | null
  currentBranch: string
}

const initialState: GitState = {
  commits: [],
  loading: false,
  error: null,
  currentBranch: 'main'
}

// Async thunks for Git operations
export const getGitHistory = createAsyncThunk(
  'git/getHistory',
  async () => {
    const commits = await window.electronAPI.git.getHistory()
    return commits as GitCommit[]
  }
)

export const rollbackToCommit = createAsyncThunk(
  'git/rollback',
  async (commitHash: string) => {
    await window.electronAPI.git.rollback(commitHash)
    return commitHash
  }
)

const gitSlice = createSlice({
  name: 'git',
  initialState,
  reducers: {
    setCurrentBranch: (state, action: PayloadAction<string>) => {
      state.currentBranch = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    addCommit: (state, action: PayloadAction<GitCommit>) => {
      state.commits.unshift(action.payload) // Add to beginning for chronological order
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Git history
      .addCase(getGitHistory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getGitHistory.fulfilled, (state, action) => {
        state.loading = false
        state.commits = action.payload
      })
      .addCase(getGitHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to get Git history'
      })
      
      // Rollback to commit
      .addCase(rollbackToCommit.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(rollbackToCommit.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(rollbackToCommit.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to rollback'
      })
  }
})

export const {
  setCurrentBranch,
  clearError,
  addCommit
} = gitSlice.actions

export default gitSlice.reducer