import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type { Transaction } from '@/lib/finance/types'
import { dataLoaded, dataReset } from '../actions'

export interface TransactionsState {
  items: Transaction[]
  /** Balance before the earliest recorded transaction, in pence. */
  openingBalance: number
}

const initialState: TransactionsState = {
  items: [],
  openingBalance: 0,
}

export type NewTransaction = Omit<Transaction, 'id'>

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    transactionAdded: {
      reducer(state, action: PayloadAction<Transaction>) {
        state.items.push(action.payload)
      },
      prepare(transaction: NewTransaction) {
        return { payload: { ...transaction, id: `txn_${nanoid(10)}` } }
      },
    },
    transactionUpdated(state, action: PayloadAction<Transaction>) {
      const index = state.items.findIndex((item) => item.id === action.payload.id)
      if (index !== -1) state.items[index] = action.payload
    },
    transactionDeleted(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    const replace = (state: TransactionsState, action: ReturnType<typeof dataLoaded>) => {
      state.items = action.payload.data.transactions
      state.openingBalance = action.payload.data.openingBalance
    }
    builder.addCase(dataLoaded, replace).addCase(dataReset, replace)
  },
})

export const { transactionAdded, transactionUpdated, transactionDeleted } =
  transactionsSlice.actions
export default transactionsSlice.reducer
