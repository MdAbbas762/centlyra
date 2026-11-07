import { configureStore } from '@reduxjs/toolkit'
import appReducer from './slices/appSlice'
import budgetsReducer from './slices/budgetsSlice'
import transactionsReducer from './slices/transactionsSlice'

export function makeStore() {
  return configureStore({
    reducer: {
      app: appReducer,
      transactions: transactionsReducer,
      budgets: budgetsReducer,
    },
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
