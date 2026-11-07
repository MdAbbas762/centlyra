import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { IsoDate, MonthKey } from '@/lib/finance/types'
import { dataLoaded, dataReset } from '../actions'

export type AnalyticsRange = 3 | 6 | 12

export interface AppState {
  /** True once stored data has been read on the client. */
  hydrated: boolean
  /** The user's current date, set on the client so server and client markup match. */
  today: IsoDate
  /** Reporting month chosen by the user. Null follows the current month. */
  selectedMonth: MonthKey | null
  analyticsRange: AnalyticsRange
}

const initialState: AppState = {
  hydrated: false,
  today: '1970-01-01',
  selectedMonth: null,
  analyticsRange: 6,
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    monthSelected(state, action: PayloadAction<MonthKey>) {
      state.selectedMonth = action.payload
    },
    analyticsRangeSelected(state, action: PayloadAction<AnalyticsRange>) {
      state.analyticsRange = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(dataLoaded, (state, action) => {
        state.hydrated = true
        state.today = action.payload.today
      })
      .addCase(dataReset, (state, action) => {
        state.today = action.payload.today
        state.selectedMonth = null
      })
  },
})

export const { monthSelected, analyticsRangeSelected } = appSlice.actions
export default appSlice.reducer
