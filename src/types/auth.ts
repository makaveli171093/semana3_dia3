export type UserRole = "admin" | "cliente";

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar_url: string | null;
  created_at?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_role: string;
  user_name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export function normalizeRole(role: string): UserRole | null {
  const normalized = role.trim().toLowerCase();

  if (normalized === "admin") return "admin";
  if (normalized === "cliente") return "cliente";

  return null;
}
