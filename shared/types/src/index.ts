export interface User {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  provider: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

export interface CreatePostDto {
  title: string;
  content: string;
}

export interface GoogleAuthDto {
  token: string;
}
