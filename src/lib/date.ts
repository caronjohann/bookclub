import { MS_PER_DAY } from './constants'

export const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * MS_PER_DAY)
