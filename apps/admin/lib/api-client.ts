import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Response interceptor - trata erros globalmente
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          console.warn("Token expirado ou inválido");
          // Remover redirecionamento automático para evitar loops
          // O middleware do Clerk já cuida disso
        } else if (error.response?.status === 403) {
          console.error("Acesso negado - permissões insuficientes");
        } else if (error.response?.status >= 500) {
          console.error("Erro interno do servidor");
        }

        return Promise.reject(error);
      }
    );
  }

  // Método para definir token manualmente (útil para hooks)
  public setAuthToken(token: string | null) {
    if (token) {
      this.instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete this.instance.defaults.headers.common["Authorization"];
    }
  }

  // Métodos HTTP
  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put(url, data, config);
  }

  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch(url, data, config);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete(url, config);
  }

  // Método para fazer requests com token específico
  public authenticatedRequest<T = any>(token: string, config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const configWithAuth = {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      },
    };

    return this.instance.request(configWithAuth);
  }

  // Método para fazer requests sem token (ex: endpoints públicos)
  public publicRequest<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const publicInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
      timeout: 10000,
    });

    return publicInstance.request(config);
  }
}

// Singleton instance
const apiClient = new ApiClient();

export default apiClient;
