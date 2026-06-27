import { apiClient } from '../api-client'

export interface ReferralStats {
  referralCode: string
  referralLink: string
  totalReferred: number
  pendingRewards: number
  claimedRewards: number
  currency: string
}

export interface ReferralHistoryItem {
  id: string
  email: string
  status: 'Pending' | 'Completed'
  reward: number
  joinedAt: string
}

export const getReferralStats = (): Promise<ReferralStats> =>
  apiClient('/referrals', { useProxy: false })

export const getReferralHistory = (): Promise<ReferralHistoryItem[]> =>
  apiClient('/referrals/history', { useProxy: false })
