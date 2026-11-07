import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type { Budget } from '@/lib/finance/types'
import { dataLoaded, dataReset } from '../actions'

export interface BudgetsState {
  items: Budget[]
}

const initialState: BudgetsState = { items: [] }

export type NewBudget = Omit<Budget, 'id'>

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    budgetAdded: {
      reducer(state, action: PayloadAction<Budget>) {
        const exists = state.items.some((item) => item.categoryId === action.payload.categoryId)
        if (!exists) state.items.push(action.payload)
      },
      prepare(budget: NewBudget) {
        return { payload: { ...budget, id: `bud_${nanoid(10)}` } }
      },
    },
    budgetLimitUpdated(state, action: PayloadAction<{ id: string; limit: number }>) {
      const budget = state.items.find((item) => item.id === action.payload.id)
      if (budget) budget.limit = action.payload.limit
    },
    budgetDeleted(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    const replace = (state: BudgetsState, action: ReturnType<typeof dataLoaded>) => {
      state.items = action.payload.data.budgets
    }
    builder.addCase(dataLoaded, replace).addCase(dataReset, replace)
  },
})

export const { budgetAdded, budgetLimitUpdated, budgetDeleted } = budgetsSlice.actions
export default budgetsSlice.reducer
