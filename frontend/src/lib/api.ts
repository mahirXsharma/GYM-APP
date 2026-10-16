
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin?: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface SessionItem {
  id: number;
  scheduledFor: string;
  capacity: number;
  seatsRemaining: number;
  _count?: {
    bookings: number;
  };
}

export interface BookingItem {
  id: number;
  createdAt: string;
  userId: number;
  sessionId: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'WAITING_LIST' | 'ATTENDED' | 'NO_SHOW';
  code: string | null;
  session?: SessionItem;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('gym_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new ApiError(
      'Unable to connect to server. Please check your connection and make sure the server is running.',
      0
    );
  }

  let data: any = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const errorMessage = data?.error || data?.message || `Request failed with status ${res.status}`;
    throw new ApiError(errorMessage, res.status, data);
  }

  return data as T;
}

export const authApi = {
  signup: (payload: { name: string; email: string; password: string }) =>
    request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export const sessionsApi = {
  getSessions: (showAll: boolean = false) =>
    request<{ message: string; sessions: SessionItem[] }>(`/sessions${showAll ? '?all=true' : ''}`),

  bookSession: (sessionId: number) =>
    request<{ message: string; booking: BookingItem; seatsRemaining?: number }>(`/sessions/${sessionId}`, {
      method: 'POST',
    }),
};

export const bookingsApi = {
  getMyBookings: (activeOnly: boolean = false) =>
    request<{ bookings: BookingItem[] }>(`/booking${activeOnly ? '?active=true' : ''}`),

  cancelBooking: (bookingId: number) =>
    request<{ message: string; booking: BookingItem }>(`/booking/${bookingId}`, {
      method: 'DELETE',
    }),
};

export const adminApi = {
  createSession: (payload: { scheduledFor: string; capacity: number }) =>
    request<{ message: string; session: SessionItem }>('/sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAllSessions: () => sessionsApi.getSessions(true),

  getAllBookings: () => bookingsApi.getMyBookings(),

  markAttendance: (code: string) =>
    request<{ message: string; booking: BookingItem }>('/booking/check-in', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
};

