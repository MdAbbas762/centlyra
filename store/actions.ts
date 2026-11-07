import { createAction } from '@reduxjs/toolkit'
import type { IsoDate, PersistedData } from '@/lib/finance/types'

export interface DataPayload {
  data: PersistedData
  today: IsoDate
}

/** Loads stored or freshly created data into the store once the client is ready. */
export const dataLoaded = createAction<DataPayload>('app/dataLoaded')

/** Replaces everything with a fresh set of sample data. */
export const dataReset = createAction<DataPayload>('app/dataReset')
