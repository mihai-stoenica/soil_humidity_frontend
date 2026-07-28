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
      const data = response.data;
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("accessToken", data.accessToken);
      return data.user;
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

  logout: () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("accessToken");
  },
};
