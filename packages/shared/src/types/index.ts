// API Response 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User 타입
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
}

// Pagination 타입
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export * from "./blog.js";
