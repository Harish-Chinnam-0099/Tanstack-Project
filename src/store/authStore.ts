import { Store } from "@tanstack/store";
import type { AuthUser } from "../types";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
};

export const authStore = new Store<AuthState>({
  user: null,
  token: null,
  isAuthenticated: false,
});

export const setAuth = (data: AuthUser) => {
  authStore.setState(() => ({
    user: data,
    token: data.accessToken,
    isAuthenticated: true,
  }));

  localStorage.setItem("token", data.accessToken);
};

export const logout = () => {
  authStore.setState(() => ({
    user: null,
    token: null,
    isAuthenticated: false,
  }));

  localStorage.removeItem("token");
};