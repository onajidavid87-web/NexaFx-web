import { apiClient } from "@/lib/api-client";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  walletAddress: string;
  phone?: string;
}

export async function getUserProfile(): Promise<UserProfile> {
  return apiClient<UserProfile>("/users/profile", {
    method: "GET",
  });
}
