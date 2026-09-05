import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { supabase, isLocalMode } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { logger } from '../lib/logger';
import { bootstrapCloudSync } from '../services/cloudSync';

const LOCAL_USER_KEY = 'crm_local_user';

interface AppState {
  user: User | null;
  session: Session | null;
  companyId: string | null;
  initialized: boolean;
  loading: boolean;
  isLocalMode: boolean;
}

interface AppContextType extends AppState {
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  localLogin: (email: string, name?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function createLocalUser(email: string, name?: string): User {
  const companyId = localStorage.getItem('crm_local_company_id') || crypto.randomUUID();
  localStorage.setItem('crm_local_company_id', companyId);
  return {
    id: 'local-user-id',
    email,
    user_metadata: {
      company_id: companyId,
      company_name: name || 'مكتب سيارات صينية',
    },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as unknown as User;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    user: null,
    session: null,
    companyId: null,
    initialized: false,
    loading: true,
    isLocalMode,
  });

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const localLogin = useCallback((email: string, name?: string) => {
    const user = createLocalUser(email, name);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify({ email, name }));
    updateState({
      user,
      session: null,
      companyId: user.user_metadata.company_id,
      initialized: true,
      loading: false,
    });
  }, [updateState]);

  const refreshAuth = useCallback(async () => {
    if (isLocalMode) {
      try {
        const saved = localStorage.getItem(LOCAL_USER_KEY);
        if (saved) {
          const { email, name } = JSON.parse(saved);
          const user = createLocalUser(email, name);
          updateState({
            user,
            session: null,
            companyId: user.user_metadata.company_id,
            initialized: true,
            loading: false,
          });
          return;
        }
      } catch {
        // ignore
      }
      updateState({ initialized: true, loading: false });
      return;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      const user = session?.user ?? null;
      const cid = user?.user_metadata?.company_id || null;
      updateState({
        session,
        user,
        companyId: cid,
        initialized: true,
        loading: false,
      });
    } catch (err) {
      logger.error('AppProvider initialization error:', err);
      updateState({ initialized: true, loading: false });
    }
  }, [updateState]);

  useEffect(() => {
    refreshAuth();

    // مزامنة سحابية تلقائية عند الفتح
    void bootstrapCloudSync().then((r) => {
      if (r.pulled) {
        // إعادة تحميل مرة واحدة لتطبيق البيانات الجديدة من السحابة
        const flag = 'crm_cloud_boot_reload';
        if (!sessionStorage.getItem(flag)) {
          sessionStorage.setItem(flag, '1');
          window.location.reload();
        }
      }
    });

    if (isLocalMode) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      const cid = user?.user_metadata?.company_id || null;
      updateState({
        session,
        user,
        companyId: cid,
        initialized: true,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, [refreshAuth, updateState]);

  const signOut = useCallback(async () => {
    if (isLocalMode) {
      localStorage.removeItem(LOCAL_USER_KEY);
      updateState({ user: null, session: null, companyId: null });
      return;
    }
    await supabase.auth.signOut();
    updateState({ user: null, session: null, companyId: null });
  }, [updateState]);

  const value = useMemo(
    () => ({
      ...state,
      signOut,
      refreshAuth,
      localLogin,
    }),
    [state, signOut, refreshAuth, localLogin]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
