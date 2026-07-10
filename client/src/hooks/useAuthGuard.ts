import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Hook to guard routes and redirect unauthenticated users
 * Prevents navigation during render (React anti-pattern)
 */
export function useAuthGuard(redirectTo: string = "/") {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Only navigate after component has mounted (not during render)
    if (!loading && !isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, loading, navigate, redirectTo]);

  return {
    isAuthenticated,
    loading,
    isReady: !loading,
  };
}

/**
 * Hook to require authentication and show loading state
 */
export function useRequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate]);

  return {
    isAuthenticated,
    isLoading: loading,
    canRender: isAuthenticated && !loading,
  };
}
