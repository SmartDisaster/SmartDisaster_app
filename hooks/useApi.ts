import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: unknown[]) => Promise<T>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });
      try {
        const result = await apiFunction(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err: unknown) {
        const message = extractErrorMessage(err);
        setState({ data: null, loading: false, error: message });
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

export function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    if (e.response && typeof e.response === 'object') {
      const res = e.response as Record<string, unknown>;
      if (res.data && typeof res.data === 'object') {
        const data = res.data as Record<string, unknown>;
        if (typeof data.message === 'string') return data.message;
        if (typeof data.error === 'string') return data.error;
      }
      if (typeof res.status === 'number') {
        if (res.status === 403) return 'Sem permissão para realizar esta ação.';
        if (res.status === 404) return 'Recurso não encontrado.';
        if (res.status === 400) return 'Dados inválidos. Verifique os campos.';
      }
    }
    if (typeof e.message === 'string') return e.message;
  }
  return 'Erro inesperado. Tente novamente.';
}
