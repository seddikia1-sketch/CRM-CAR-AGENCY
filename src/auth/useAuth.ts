import { useApp } from '../providers/AppProvider';

export function useAuth() {
  const { user, session, initialized, loading, signOut, isLocalMode, localLogin } = useApp();
  return {
    user,
    session,
    initialized,
    loading,
    signOut,
    isLocalMode,
    localLogin,
  };
}
