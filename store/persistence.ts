import { persistedDataSchema } from '@/lib/finance/validation'
import type { PersistedData } from '@/lib/finance/types'

export const STORAGE_KEY = 'centlyra:data:v1'

/** Reads saved data. Returns null when nothing valid is stored. */
export function loadPersistedData(storage: Storage = window.localStorage): PersistedData | null {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return null
    const result = persistedDataSchema.safeParse(JSON.parse(raw))
    return result.success ? result.data : null
  } catch {
    return null
  }
}

export function savePersistedData(
  data: PersistedData,
  storage: Storage = window.localStorage,
): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}
