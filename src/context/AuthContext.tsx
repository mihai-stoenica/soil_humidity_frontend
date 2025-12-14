import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authService, type AuthCredentials } from "../services/auth";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (data: AuthCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem("userId");
    const email = localStorage.getItem("userEmail");
    const name = localStorage.getItem("name");
    if (id && email && name) {
      setUser({ id, email, name });
    }
  }, []);

  const login = async (credentials: AuthCredentials) => {
    try {
      const userData = await authService.login(credentials);
      setUser(userData);

      // eslint-disable-next-line no-useless-catch
    } catch (error) {
      throw error;
    } finally {
      navigate("/");
    }
  };

  const register = async (data: AuthCredentials) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const userData = await authService.register(data);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
