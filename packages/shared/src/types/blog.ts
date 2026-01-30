// ============================================================
// Profile Types
// ============================================================

export interface Profile {
  id: string; // Firebase UID
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
}

// ============================================================
// Post Types
// ============================================================

export type PostStatus = "draft" | "published";

export interface Post {
  id: string;
  authorId: string;
  title: string;
  content: Record<string, unknown>; // Rich text JSON
  summary: string | null;
  coverImageUrl: string | null;
  status: PostStatus;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  deletedAt: string | null;
  author?: Pick<Profile, "id" | "displayName" | "avatarUrl">;
}

/** Subset of Post for list views (no full content) */
export interface PostSummary {
  id: string;
  authorId: string;
  title: string;
  summary: string | null;
  coverImageUrl: string | null;
  status: PostStatus;
  viewsCount: number;
  createdAt: string;
  publishedAt: string | null;
  author?: Pick<Profile, "id" | "displayName" | "avatarUrl">;
}

export interface CreatePostRequest {
  title: string;
  content: Record<string, unknown>;
  summary?: string;
  coverImageUrl?: string;
  status?: PostStatus;
}

export interface UpdatePostRequest {
  title?: string;
  content?: Record<string, unknown>;
  summary?: string;
  coverImageUrl?: string;
  status?: PostStatus;
}

export interface PostListParams {
  page?: number;
  limit?: number;
  sortBy?: "created_at" | "views_count" | "published_at";
  sortOrder?: "asc" | "desc";
  status?: PostStatus;
  authorId?: string;
  search?: string;
}

// ============================================================
// Comment Types
// ============================================================

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  author?: Pick<Profile, "id" | "displayName" | "avatarUrl">;
}

export interface CreateCommentRequest {
  content: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}
