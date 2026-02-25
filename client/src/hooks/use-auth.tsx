import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

type User = {
  id: number;
  email: string;
  role: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: z.infer<typeof api.auth.login.input>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage for simple mock persistence
  useEffect(() => {
    const stored = localStorage.getItem("neurohire_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem("neurohire_user");
      }
    }
    setIsLoading(false);
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: z.infer<typeof api.auth.login.input>) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        throw new Error("Invalid credentials");
      }
      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      setUser(data);
      localStorage.setItem("neurohire_user", JSON.stringify(data));
    },
  });

  const login = async (credentials: z.infer<typeof api.auth.login.input>) => {
    await loginMutation.mutateAsync(credentials);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("neurohire_user");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
