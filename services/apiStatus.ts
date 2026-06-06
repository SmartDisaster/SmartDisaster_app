import axios from 'axios';
import Constants from 'expo-constants';

const BASE_URL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://10.0.2.2:8080';

export interface ApiStatus {
  online: boolean;
}

// Uses a standalone axios instance (no auth interceptor) to avoid redirect side-effects
const probe = axios.create({ baseURL: BASE_URL, timeout: 5000 });

export async function checkApiStatus(): Promise<ApiStatus> {
  try {
    await probe.get('/actuator/health');
    return { online: true };
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number } };
    if (axiosErr.response) {
      // Got a response — if 404 the route doesn't exist, try /abrigos
      if (axiosErr.response.status === 404) {
        try {
          await probe.get('/abrigos');
          return { online: true };
        } catch (err2: unknown) {
          const axiosErr2 = err2 as { response?: unknown };
          return { online: !!axiosErr2.response };
        }
      }
      // Any other HTTP status (401, 403, 500…) means server is reachable
      return { online: true };
    }
    // Network error / timeout — server is offline
    return { online: false };
  }
}
