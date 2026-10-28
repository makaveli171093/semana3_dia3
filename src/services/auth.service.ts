import { api } from "./api";
import type {
  LoginCredentials,
  LoginResponse,
  UserProfile,
} from "../types/auth";

export const authService = {
  async login(credentials: LoginCredentials) {
    const { data } = await api.post<LoginResponse>("/auth/login", credentials);

    localStorage.setItem("funval_token", data.access_token);

    return data;
  },

  async me() {
    const { data } = await api.get<UserProfile>("/auth/me");
    return data;
  },

  async logout() {
    localStorage.removeItem("funval_token");
  },
};
