import { api } from "./api";
import type { UserProfile } from "../types/auth";

export interface CreateUserData {
  email: string;
  name: string;
  role: "admin" | "cliente";
  password: string;
}

export interface UpdateUserData {
  email: string;
  name: string;
  role: "admin" | "cliente";
  password?: string;
  avatar_url?: string;
}

export const usersService = {
  async list() {
    const { data } = await api.get<UserProfile[]>("/users/");
    return data;
  },

  async create(user: CreateUserData) {
    const { data } = await api.post<UserProfile>("/users/", user);
    return data;
  },

  async update(id: number, user: UpdateUserData) {
    const { data } = await api.put<UserProfile>(`/users/${id}`, user);
    return data;
  },
};
