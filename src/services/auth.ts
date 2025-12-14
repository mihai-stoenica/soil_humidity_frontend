import { post } from "./http.ts";

export interface AuthCredentials {
  email: string;
  password: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const authService = {
  login: async (credentials: AuthCredentials) => {
    const response = await post(`${API_URL}/auth/login`, credentials);

    if (!response.isError) {
      const user = response.data;
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("name", user.name);
      return user;
    }
    throw new Error(response.message || "Login failed");
  },

  register: async (data: AuthCredentials) => {
    const response = await post(`${API_URL}/auth/register`, data);
    if (!response.isError) {
      return await authService.login(data);
    }
    throw new Error(response.message || "Registration failed");
  },

  logout: async () => {
    await post(`${API_URL}/auth/logout`, {});
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
  },
};
