
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import type { User, Permission, ProviderPermission, LandingPageConfig } from '../types';
import { api, MOCK_USERS } from '../services/mockApi';
import { Role } from '../types';

interface AppContextType {
  currentUser: User | null;
  permissions: (Permission | ProviderPermission)[];
  landingPageConfig: LandingPageConfig | null;
  fetchLandingPageConfig: () => Promise<void>;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<(Permission | ProviderPermission)[]>([]);
const [landingPageConfig, setLandingPageConfig] =
  useState<LandingPageConfig | null>({
    logoHeaderUrl: null,
    heroTitle: "Mapple School",
    heroSubtitle: "Plataforma educativa todo-en-uno",
    heroBannerUrl: null,
  });

const fetchLandingPageConfig = useCallback(async () => {
  console.log("🟡 fetchLandingPageConfig ejecutándose");

  try {
    const config = await api.getLandingPageConfig();
    console.log("🟢 Landing config recibido:", config);
    setLandingPageConfig(config);
  } catch (error) {
    console.error("🔴 Error cargando landing config:", error);
  }
}, []);

useEffect(() => {
  console.log("🟣 AppProvider mounted");
  fetchLandingPageConfig();
}, [fetchLandingPageConfig]);

  const login = useCallback(async (email: string, password?: string) => {
    try {
      let user: User | undefined;
      
      if (password) {
          // Actual login flow with credentials
          user = await api.login(email, password);
      } else {
          // Fallback for impersonation (using ID as first arg)
          user = await api.getUserById(email);
      }
      
      if (user) {
        const userPermissions = await api.getPermissionsForUser(user.id);
        setCurrentUser(user);
        setPermissions(userPermissions);
        return true;
      } else {
          console.error("User not found or invalid credentials.");
          return false;
      }
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const impersonateId = params.get('impersonate');
    if (impersonateId) {
        login(impersonateId); // Logic handles ID lookup if no password
        // Clean up the URL so refresh doesn't re-trigger logic or look messy
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [login]);

useEffect(() => {
  setLandingPageConfig({
    logoHeaderUrl: "",
    heroTitle: "Mapple School",
    heroSubtitle: "La plataforma que conecta padres, escuelas y estudiantes",
    heroBannerUrl: ""
  });
}, []);

  const logout = () => {
    setCurrentUser(null);
    setPermissions([]);
  };

  return (
    <AppContext.Provider value={{ currentUser, permissions, landingPageConfig, fetchLandingPageConfig, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
