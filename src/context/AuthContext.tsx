import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authService } from "../services/auth.service";
import {
  normalizeRole,
  type LoginCredentials,
  type UserProfile,
  type UserRole,
} from "../types/auth";

interface AuthContextValue {
  user: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const applyUser = useCallback((profile: UserProfile) => {
    const normalizedRole = normalizeRole(profile.role);

    if (!normalizedRole) {
      localStorage.removeItem("funval_token");
      setUser(null);
      setRole(null);
      throw new Error(`Rol no reconocido por la aplicación: ${profile.role}`);
    }

    setUser(profile);
    setRole(normalizedRole);
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await authService.me();
    applyUser(profile);
  }, [applyUser]);

  const logout = useCallback(() => {
    void authService.logout();
    setUser(null);
    setRole(null);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      await authService.login(credentials);

      try {
        await refreshProfile();
      } catch (error) {
        localStorage.removeItem("funval_token");
        setUser(null);
        setRole(null);
        throw error;
      }
    },
    [refreshProfile],
  );

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!localStorage.getItem("funval_token")) {
        setLoading(false);
        return;
      }

      try {
        const profile = await authService.me();

        if (active) applyUser(profile);
      } catch {
        localStorage.removeItem("funval_token");

        if (active) {
          setUser(null);
          setRole(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, [applyUser]);

  return (
    <AuthContext.Provider
      value={{ user, role, loading, login, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }

  return context;
}
