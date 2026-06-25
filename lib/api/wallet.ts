import { apiClient } from "../api-client";

export interface WalletBalance {
  currency: string
  amount: number
  walletAddress?: string
  balance: string // Retained for backward compatibility with other components
}

export const getBalances = async (): Promise<WalletBalance[]> => {
  // The correct backend route is `/users/wallet/balances` (not `/wallets/balances`).
  // This route is protected and should be called directly (no proxy) —
  // other authenticated user endpoints use `useProxy: false` as well.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await apiClient<any>("/users/wallet/balances", {
    method: "GET",
    useProxy: false,
  });
  
  const rawList = Array.isArray(data) ? data : (data.data ?? data.balances ?? []);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rawList.map((item: any) => {
    const amountVal = item.amount !== undefined ? Number(item.amount) : Number(item.balance || 0);
    const balanceVal = item.balance !== undefined ? String(item.balance) : String(item.amount || "0.00");
    return {
      currency: item.currency,
      amount: amountVal,
      walletAddress: item.walletAddress,
      balance: balanceVal,
    };
  });
};
