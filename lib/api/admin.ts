/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from '../api-client';

export interface AdminUser {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    walletAddress: string;
    username: string;
    avatarUrl: string | null;
    transactions: number;
    totalDeposit: number;
    totalWithdraw: number;
    kycStatus: 'Verified' | 'Unverified';
    createdAt: string;
    isActive: boolean;
}

export interface AdminMetrics {
    registeredUsers: number;
    totalTransactions: number;
    pendingKyc: number;
    currencies: number;
    totalDeposits: number;
    totalWithdrawals: number;
}

export interface AdminTransaction {
    id: string;
    amount: number;
    currency: string;
    type: string;
    username: string;
    date: string;
    txId: string;
    status: string;
}

export interface AdminUsersQuery {
    page?: number;
    limit?: number;
    search?: string;
}

export interface AdminTransactionsQuery {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
}

export function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    return token ? { 'x-client-token': token } : {};
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
    const response = await apiClient<any>('/admin/metrics', {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return {
        registeredUsers: response?.registeredUsers ?? response?.totalUsers ?? 0,
        totalTransactions: response?.totalTransactions ?? 0,
        pendingKyc: response?.pendingKyc ?? 0,
        currencies: response?.currencies ?? 0,
        totalDeposits: response?.totalDeposits ?? response?.totalVolume ?? 0,
        totalWithdrawals: response?.totalWithdrawals ?? 0,
    };
}

export async function getAdminUsers(query: AdminUsersQuery = {}): Promise<{ data: AdminUser[]; total: number }> {
    const params: Record<string, string> = {};
    if (query.page) params.page = String(query.page);
    if (query.limit) params.limit = String(query.limit);
    if (query.search) params.search = query.search;

    const response = await apiClient<any>('/admin/users', {
        method: 'GET',
        headers: getAuthHeaders(),
        params,
    });

    const data = (response?.data ?? response?.users ?? response?.items ?? (Array.isArray(response) ? response : [])) as any[];
    const total = response?.total ?? response?.count ?? data.length;

    const mappedData = data.map((user: any) => ({
        id: user.id ?? user._id ?? '',
        email: user.email ?? '',
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        phone: user.phone ?? null,
        walletAddress: user.walletAddress ?? user.wallet_address ?? '',
        username: user.username ?? user.email?.split('@')[0] ?? '',
        avatarUrl: user.avatarUrl ?? null,
        transactions: Number(user.transactions) || 0,
        totalDeposit: Number(user.totalDeposit ?? user.total_deposit) || 0,
        totalWithdraw: Number(user.totalWithdraw ?? user.total_withdraw) || 0,
        kycStatus: ((user.kycStatus === 'Verified' || user.kycStatus === 'verified') ? 'Verified' : 'Unverified') as 'Verified' | 'Unverified',
        createdAt: user.createdAt
            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
              })
            : '',
        isActive: user.isActive ?? true,
    }));

    return { data: mappedData, total };
}

export async function getAdminUserById(id: string): Promise<AdminUser> {
    const response = await apiClient<any>(`/admin/users/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    const user = response?.data ?? response;
    return {
        id: user.id ?? user._id ?? '',
        email: user.email ?? '',
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        phone: user.phone ?? null,
        walletAddress: user.walletAddress ?? user.wallet_address ?? '',
        username: user.username ?? user.email?.split('@')[0] ?? '',
        avatarUrl: user.avatarUrl ?? null,
        transactions: Number(user.transactions) || 0,
        totalDeposit: Number(user.totalDeposit ?? user.total_deposit) || 0,
        totalWithdraw: Number(user.totalWithdraw ?? user.total_withdraw) || 0,
        kycStatus: ((user.kycStatus === 'Verified' || user.kycStatus === 'verified') ? 'Verified' : 'Unverified') as 'Verified' | 'Unverified',
        createdAt: user.createdAt
            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
              })
            : '',
        isActive: user.isActive ?? true,
    };
}

export async function deleteAdminUser(id: string): Promise<void> {
    await apiClient<void>(`/admin/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
}

export async function updateUserKyc(id: string, status: 'Verified' | 'Unverified'): Promise<void> {
    await apiClient<void>(`/admin/users/${id}/kyc`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });
}

export async function getAdminTransactions(query: AdminTransactionsQuery = {}): Promise<{ data: AdminTransaction[]; total: number }> {
    const params: Record<string, string> = {};
    if (query.page) params.page = String(query.page);
    if (query.limit) params.limit = String(query.limit);
    if (query.search) params.search = query.search;
    if (query.type && query.type !== 'All') {
        params.type = query.type === 'Withdrawal' ? 'withdraw' : query.type.toLowerCase();
    }

    const response = await apiClient<any>('/admin/transactions', {
        method: 'GET',
        headers: getAuthHeaders(),
        params,
    });

    const data = (response?.data ?? response?.transactions ?? response?.items ?? (Array.isArray(response) ? response : [])) as any[];
    const total = response?.total ?? response?.count ?? data.length;

    const mappedData = data.map((tx: any) => {
        const rawDate = tx.createdAt ?? tx.date ?? '';
        const formattedDate = rawDate
            ? new Date(rawDate).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
              })
            : '';

        return {
            id: tx.id ?? tx._id ?? '',
            amount: Number(tx.amount) || 0,
            currency: tx.currency ?? '',
            type: tx.type ?? '',
            username: tx.username ?? tx.user?.email ?? tx.email ?? '',
            date: formattedDate,
            txId: tx.txId ?? tx.reference ?? tx.transactionRef ?? '',
            status: tx.status ?? 'Pending',
        };
    });

    return { data: mappedData, total };
}

export type AnnouncementType = 'info' | 'warning' | 'success' | 'error'

export interface Announcement {
    id: string
    title: string
    message: string
    type: AnnouncementType
    isActive: boolean
    startAt: string
    endAt: string
    createdAt: string
}

export const getAnnouncements = (): Promise<Announcement[]> =>
    apiClient('/admin/announcements')

export const createAnnouncement = (dto: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> =>
    apiClient('/admin/announcements', { method: 'POST', body: JSON.stringify(dto) })

export const toggleAnnouncement = (id: string, isActive: boolean): Promise<Announcement> =>
    apiClient(`/admin/announcements/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive }) })

export const deleteAnnouncement = (id: string): Promise<void> =>
    apiClient(`/admin/announcements/${id}`, { method: 'DELETE' })
