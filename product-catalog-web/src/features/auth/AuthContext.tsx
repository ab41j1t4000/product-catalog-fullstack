import { useMutation, useQuery } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { apiClient } from "../../lib/apiClient";

const TOKEN_STORAGE_KEY = "product-catalog-token";
const ADMIN_EMAIL = "admin@catalog.local";

type User = {
  id: string;
  email: string;
  name?: string | null;
};

type AuthContextValue = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signingIn: boolean;
  signIn: (input: { email: string; name?: string }) => Promise<void>;
  signInAdmin: (input: { username: string; password: string }) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => readToken());

  useEffect(() => {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
      return;
    }

    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, [token]);

  const meQuery = useQuery({
    queryKey: ["auth", "me", token],
    queryFn: () => apiClient<{ user: User }>("/api/auth/me", { token }),
    enabled: Boolean(token),
    retry: false,
  });

  const signInMutation = useMutation({
    mutationFn: (input: { email: string; name?: string }) =>
      apiClient<{ token: string; user: User }>("/api/auth/sign-in", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      setToken(data.token);
    },
  });

  const adminSignInMutation = useMutation({
    mutationFn: (input: { username: string; password: string }) =>
      apiClient<{ token: string; user: User }>("/api/auth/admin-sign-in", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      setToken(data.token);
    },
  });

  const user = meQuery.data?.user ?? signInMutation.data?.user ?? adminSignInMutation.data?.user ?? null;
  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token && user),
        isAdmin,
        signingIn: signInMutation.isPending || adminSignInMutation.isPending,
        signIn: async (input) => {
          await signInMutation.mutateAsync(input);
        },
        signInAdmin: async (input) => {
          await adminSignInMutation.mutateAsync(input);
        },
        signOut: () => {
          setToken(null);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
