import { useAuth } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import apiClient from "@/lib/api-client";

interface UseApiClientReturn {
  apiClient: typeof apiClient;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useApiClient(): UseApiClientReturn {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [tokenConfigured, setTokenConfigured] = useState(false);

  const setupToken = useCallback(async () => {
    if (isLoaded && isSignedIn) {
      try {
        const token = await getToken();
        if (token) {
          apiClient.setAuthToken(token);
          setTokenConfigured(true);
        }
      } catch (error) {
        console.error("Erro ao configurar token:", error);
        apiClient.setAuthToken(null);
        setTokenConfigured(false);
      }
    } else if (isLoaded && !isSignedIn) {
      apiClient.setAuthToken(null);
      setTokenConfigured(true); // Consideramos "configurado" mesmo sem token
    }
  }, [isLoaded, isSignedIn, getToken]);

  useEffect(() => {
    setupToken();
  }, [setupToken]);

  // Atualizar token periodicamente para evitar expiração
  useEffect(() => {
    if (!isSignedIn) return;

    const interval = setInterval(async () => {
      try {
        const token = await getToken();
        if (token) {
          apiClient.setAuthToken(token);
        }
      } catch (error) {
        console.error("Erro ao atualizar token:", error);
      }
    }, 50000); // Atualiza a cada 50 segundos (tokens do Clerk duram 1 minuto)

    return () => clearInterval(interval);
  }, [isSignedIn, getToken]);

  return {
    apiClient,
    isAuthenticated: isLoaded && isSignedIn && tokenConfigured,
    isLoading: !isLoaded || (isSignedIn && !tokenConfigured),
  };
}
