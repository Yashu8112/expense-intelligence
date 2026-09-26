import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { API_BASE_URL, API_TIMEOUT } from '../config/api';

// ─────────────────────────────────────────────────────────────────────────────
// Token helpers
// ─────────────────────────────────────────────────────────────────────────────
export const TOKEN_KEY = 'jwt_token';

export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = async (token: string): Promise<void> => {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token provided to SecureStore. Token must be a non-empty string.');
  }
  await SecureStore.setItemAsync(TOKEN_KEY, String(token));
};

export const removeToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // ignore
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Axios instance
// ─────────────────────────────────────────────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor – attach JWT
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface User {
  id: string | number;
  fullName?: string;
  name?: string;
  email: string;
  avatarUrl?: string;
  role?: string;
}

export interface Category {
  id: string | number;
  name: string;
  icon?: string;
  color?: string;
}

export interface Expense {
  id: string | number;
  title: string;
  amount: number;
  expenseDate?: string;
  date?: string;
  paymentMethod: 'CARD' | 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'OTHER';
  categoryId?: string | number;
  category?: Category;
  merchant?: string;
  notes?: string;
  isRecurring?: boolean;
  recurring?: boolean;
  aiProcessed?: boolean;
  aiCategory?: string;
}

export interface ExpenseFilters {
  search?: string;
  categoryId?: string | number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface CategoryStat {
  category: string;
  color?: string;
  total: number;
  percentage: number;
  name?: string;
  amount?: number;
}

export interface MonthlyStat {
  month: number;
  year: number;
  total: number;
  label: string;
  amount?: number;
}

export interface DashboardStats {
  totalThisMonth: number;
  totalLastMonth?: number;
  changePercent?: number;
  highestCategory?: string;
  highestCategoryAmount?: number;
  totalExpensesCount?: number;
  totalTransactions?: number;
  averageExpense?: number;
  avgPerTransaction?: number;
  monthlyTrend: MonthlyStat[];
  categoryBreakdown: CategoryStat[];
}

export interface Insight {
  id: string | number;
  title: string;
  content?: string;
  description?: string;
  insightType?: string;
  type?: string;
  createdAt?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Mirrors backend AiDto.MonthlySummary
export interface MonthlySummary {
  month: number;
  year: number;
  totalSpending?: number;
  previousMonthSpending?: number;
  changePercent?: number;
  topCategory?: string;
  aiNarrative?: string;
  keyInsights?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (payload: LoginPayload) =>
    apiClient.post('/auth/login', payload),

  signup: (payload: SignupPayload) =>
    apiClient.post('/auth/signup', payload),

  getMe: () =>
    apiClient.get('/auth/me'),
};

// ─────────────────────────────────────────────────────────────────────────────
// Expense API
// ─────────────────────────────────────────────────────────────────────────────
export const expenseAPI = {
  getAll: (filters?: ExpenseFilters) =>
    apiClient.get('/expenses', { params: filters }),

  getById: (id: string | number) =>
    apiClient.get(`/expenses/${id}`),

  create: (data: any) =>
    apiClient.post('/expenses', data),

  update: (id: string | number, data: any) =>
    apiClient.put(`/expenses/${id}`, data),

  delete: (id: string | number) =>
    apiClient.delete(`/expenses/${id}`),

  dashboard: () =>
    apiClient.get('/expenses/dashboard/stats'),

  categories: () =>
    apiClient.get('/expenses/categories'),
};

// ─────────────────────────────────────────────────────────────────────────────
// AI API
// ─────────────────────────────────────────────────────────────────────────────
export const aiAPI = {
  generateInsights: () =>
    apiClient.post('/ai/insights/generate'),

  getInsights: (limit = 10) =>
    apiClient.get('/ai/insights', { params: { limit } }),

  getMonthlySummary: (month: number, year: number) =>
    apiClient.get('/ai/monthly-summary', { params: { month, year } }),

  chat: (payload: { message: string; sessionId?: string | null }) =>
    apiClient.post('/ai/chat', payload),
};

// ─────────────────────────────────────────────────────────────────────────────
// Report API
// ─────────────────────────────────────────────────────────────────────────────
export const reportAPI = {
  // Backend requires both startDate and endDate (ISO yyyy-MM-dd).
  // Downloads the authenticated report into the cache directory and opens the
  // native share sheet so the user can save or open it.
  downloadReport: async (
    type: 'pdf' | 'excel',
    startDate: string,
    endDate: string
  ): Promise<string> => {
    const token = await getToken();
    const ext = type === 'pdf' ? 'pdf' : 'xlsx';
    const filename = `expense-report-${startDate}-to-${endDate}.${ext}`;
    const url = `${API_BASE_URL}/reports/${type}?startDate=${startDate}&endDate=${endDate}`;

    const res = await FileSystem.downloadAsync(url, `${FileSystem.cacheDirectory}${filename}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (res.status !== 200 || !res.uri) {
      throw new Error(`Report download failed (HTTP ${res.status ?? 'network error'})`);
    }

    const mimeType =
      type === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(res.uri, {
        mimeType,
        dialogTitle: type === 'pdf' ? 'Expense Report (PDF)' : 'Expense Report (Excel)',
      });
    }
    return res.uri;
  },
};

export default apiClient;
