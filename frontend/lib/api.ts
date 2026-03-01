import type { User, RegisterRequest, LoginRequest, AuthResponse, Task, TaskCreate, TaskUpdate } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    // Dispatch event for auth context to handle
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || "Unauthorized");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  register(data: RegisterRequest): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login(data: LoginRequest): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  logout(): Promise<{ message: string }> {
    return request<{ message: string }>("/auth/logout", {
      method: "POST",
    });
  },

  getMe(): Promise<User> {
    return request<User>("/me");
  },

  getTasks(userId: number): Promise<Task[]> {
    return request<Task[]>(`/${userId}/tasks`);
  },

  createTask(userId: number, data: TaskCreate): Promise<Task> {
    return request<Task>(`/${userId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getTask(userId: number, taskId: number): Promise<Task> {
    return request<Task>(`/${userId}/tasks/${taskId}`);
  },

  updateTask(userId: number, taskId: number, data: TaskUpdate): Promise<Task> {
    return request<Task>(`/${userId}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteTask(userId: number, taskId: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/${userId}/tasks/${taskId}`, {
      method: "DELETE",
    });
  },

  toggleTask(userId: number, taskId: number): Promise<Task> {
    return request<Task>(`/${userId}/tasks/${taskId}/complete`, {
      method: "PATCH",
    });
  },

  getLatestConversation(userId: number): Promise<{ conversation_id: number | null; title?: string | null; created_at?: string }> {
    return request(`/${userId}/conversations/latest`);
  },

  getConversationMessages(userId: number, conversationId: number): Promise<{ id: number; role: string; content: string; created_at: string }[]> {
    return request(`/${userId}/conversations/${conversationId}/messages`);
  },
};
