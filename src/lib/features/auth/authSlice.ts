import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface User {
  id: string
  name: string
  email: string
  linkedinUrl: string
  profileImage?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: "idle",
  error: null,
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.error = null
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
  },
})

export const { login, logout, setAuthError } = authSlice.actions

export default authSlice.reducer
