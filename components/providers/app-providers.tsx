'use client'

import { MotionConfig } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { getTodayIso } from '@/lib/finance/dates'
import { makeStore, type AppStore } from '@/store'
import { dataLoaded } from '@/store/actions'
import { loadPersistedData, savePersistedData } from '@/store/persistence'

function StorageSync({ store }: { store: AppStore }) {
  useEffect(() => {
    const today = getTodayIso()
    // New devices start with a clean personal workspace. Example data is opt-in.
    const data = loadPersistedData() ?? {
      version: 1 as const,
      openingBalance: 0,
      transactions: [],
      budgets: [],
    }
    store.dispatch(dataLoaded({ data, today }))

    let previous = store.getState()
    return store.subscribe(() => {
      const state = store.getState()
      const changed =
        state.transactions !== previous.transactions || state.budgets !== previous.budgets
      previous = state
      if (!changed || !state.app.hydrated) return
      savePersistedData({
        version: 1,
        openingBalance: state.transactions.openingBalance,
        transactions: state.transactions.items,
        budgets: state.budgets.items,
      })
    })
  }, [store])

  return null
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [store] = useState<AppStore>(makeStore)

  return (
    <Provider store={store}>
      <MotionConfig reducedMotion="user">
        <StorageSync store={store} />
        {children}
        <Toaster
          position="bottom-right"
          theme="light"
          toastOptions={{
            classNames: {
              toast:
                '!rounded-xl !border !border-border !bg-card !text-foreground !shadow-lg !font-sans',
              description: '!text-muted-foreground',
            },
          }}
        />
      </MotionConfig>
    </Provider>
  )
}
