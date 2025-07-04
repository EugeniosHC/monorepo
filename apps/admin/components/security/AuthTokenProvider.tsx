"use client";

/**
 * Componente simples que apenas renderiza os children
 * A configuração do token agora é feita pelo useApiClient hook
 */
export function AuthTokenProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
