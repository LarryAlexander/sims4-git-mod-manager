import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'

import modsReducer from './slices/modsSlice'
import profilesReducer from './slices/profilesSlice'
import gitReducer from './slices/gitSlice'
import appReducer from './slices/appSlice'

export const store = configureStore({
  reducer: {
    mods: modsReducer,
    profiles: profilesReducer,
    git: gitReducer,
    app: appReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector