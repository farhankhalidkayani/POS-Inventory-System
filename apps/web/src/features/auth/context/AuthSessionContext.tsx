"use client";

import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import type { AuthUserResponse, OrganizationResponse, StoreResponse } from "@pos/shared";
import { authApi } from "../api/authApi";

export interface AuthSession {
  accessToken: string;
  user: AuthUserResponse;
  organization: OrganizationResponse;
  store: StoreResponse | null;
}

interface AuthSessionContextValue {
  session: AuthSession | null;
  isBootstrapping: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        const { accessToken } = await authApi.refresh();
        const currentUser = await authApi.me(accessToken);
        if (isMounted) {
          setSessionState({ accessToken, ...currentUser });
        }
      } catch {
        if (isMounted) {
          setSessionState(null);
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      session,
      isBootstrapping,
      setSession: setSessionState,
      clearSession: () => setSessionState(null),
    }),
    [session, isBootstrapping]
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession(): AuthSessionContextValue {
  const context = useContext(AuthSessionContext);
  if (!context) {
    throw new Error("useAuthSession must be used within an AuthSessionProvider");
  }
  return context;
}
