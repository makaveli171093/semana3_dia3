import { api } from "./api";
import type { UserProfile } from "../types/auth";

export interface ProfileUpdate {
  name: string;
  foto?: File;
}

export const profileService = {
  async update(data: ProfileUpdate) {
    const form = new FormData();
    form.append("name", data.name);

    if (data.foto) {
      form.append("foto", data.foto);
    }

    const { data: profile } = await api.put<UserProfile>("/auth/perfil", form);

    return profile;
  },

  async uploadAvatar(file: File) {
    const form = new FormData();
    form.append("file", file);

    const { data } = await api.post<string>("/upload/", form);
    return data;
  },
};
