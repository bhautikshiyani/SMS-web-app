import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

interface AuthState {
  user: {
    name: string
    email: string
    role: string
    tenantId: string
  } | null
  token: string | null
  loading: boolean
  error: string | null
  successMessage: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  successMessage: null,
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const res = await axios.post('/api/auth/login', credentials)
      console.log('Login response:', res)
      return res.data
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Login failed')
    }
  }
)

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, thunkAPI) => {
    try {
      const res = await axios.post('/api/auth/forgot-password', { email })
      return res.data.message
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Failed to send reset email')
    }
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (
    {
      token,
      password,
      confirmPassword,
    }: { token: string; password: string; confirmPassword: string },
    thunkAPI
  ) => {
    try {
      const res = await axios.post(`/api/auth/resetPassword?token=${token}`, {
        newPassword: password,
        confirmPassword,
      })
      return res.data.message
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Failed to reset password')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.error = null
      state.successMessage = null
      localStorage.removeItem('token')
    },
    clearMessages(state) {
      state.error = null
      state.successMessage = null
    },

  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(forgotPassword.pending, (state) => {
        state.loading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(forgotPassword.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false
        state.successMessage = action.payload
      })
      .addCase(forgotPassword.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(resetPassword.pending, (state) => {
        state.loading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(resetPassword.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false
        state.successMessage = action.payload
      })
      .addCase(resetPassword.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false
        state.error = action.payload
      })


  },
})

export const { logout, clearMessages } = authSlice.actions
export default authSlice.reducer
