"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getWorkspace } from "@/lib/api/workspace.api";
import { ApiError } from "@/lib/api/api-error";

export interface User {
  id: string;
  name: string;
  email: string;
  business_id?: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  plan?: string;
  status?: string;
}

export interface WorkspaceRole {
  name: string;
}

interface UserContextType {
  user: User | null;
  business: Business | null;
  role: WorkspaceRole | null;

  setUser: (user: User | null) => void;
  setBusiness: (business: Business | null) => void;

  clearUser: () => void;

  isWorkspaceLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [role, setRole] = useState<WorkspaceRole | null>(null);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadWorkspace = async () => {
      try {
        setIsWorkspaceLoading(true);

        // Direct call to the Go backend; apiClient attaches the bearer
        // token and silently refreshes it once if it has expired.
        const data = await getWorkspace();

        if (cancelled) return;

        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          business_id: data.business.id,
        });

        setBusiness({
          id: data.business.id,
          name: data.business.name,
          slug: data.business.slug,
          plan: data.business.plan,
          status: data.business.status,
        });

        setRole({ name: data.role.name });
      } catch (error) {
        if (error instanceof ApiError) {
          console.error("Failed to load workspace:", error.message);
        } else {
          console.error("Failed to load workspace:", error);
        }
      } finally {
        if (!cancelled) setIsWorkspaceLoading(false);
      }
    };

    loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, []);

  const clearUser = () => {
    setUser(null);
    setBusiness(null);
    setRole(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        business,
        role,
        setUser,
        setBusiness,
        clearUser,
        isWorkspaceLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
};