import { supabase } from "../config/supabase.js";
import type {
  Post,
  PostSummary,
  CreatePostRequest,
  UpdatePostRequest,
  PostListParams,
  PaginatedResponse,
} from "@repo/shared";

const POST_SELECT = `
  id, author_id, title, content, summary, cover_image_url,
  status, views_count, created_at, updated_at, published_at, deleted_at,
  profiles!posts_author_id_fkey ( id, display_name, avatar_url )
`;

const POST_SUMMARY_SELECT = `
  id, author_id, title, summary, cover_image_url,
  status, views_count, created_at, published_at,
  profiles!posts_author_id_fkey ( id, display_name, avatar_url )
`;

function extractSummary(content: Record<string, unknown>, maxLength = 10): string | null {
  if (content.type === "text" && typeof content.text === "string") {
    const text = content.text.trim();
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  }
  return null;
}

export async function createPost(authorId: string, data: CreatePostRequest): Promise<Post> {
  const insertData: Record<string, unknown> = {
    author_id: authorId,
    title: data.title,
    content: data.content,
    summary: data.summary || extractSummary(data.content) || null,
    cover_image_url: data.coverImageUrl || null,
    status: data.status || "draft",
  };

  if (data.status === "published") {
    insertData.published_at = new Date().toISOString();
  }

  const { data: row, error } = await supabase
    .from("posts")
    .insert(insertData)
    .select(POST_SELECT)
    .single();

  if (error) throw new Error(`Failed to create post: ${error.message}`);
  return mapPostRow(row);
}

export async function listPosts(params: PostListParams): Promise<PaginatedResponse<PostSummary>> {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;
  const sortBy = params.sortBy || "created_at";
  const sortOrder = params.sortOrder || "desc";

  let query = supabase
    .from("posts")
    .select(POST_SUMMARY_SELECT, { count: "exact" })
    .is("deleted_at", null);

  if (params.status) {
    query = query.eq("status", params.status);
  } else {
    query = query.eq("status", "published");
  }

  if (params.authorId) {
    query = query.eq("author_id", params.authorId);
  }

  if (params.search) {
    query = query.ilike("title", `%${params.search}%`);
  }

  query = query
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(offset, offset + limit - 1);

  const { data: rows, count, error } = await query;

  if (error) throw new Error(`Failed to list posts: ${error.message}`);

  const items = (rows || []).map(mapPostSummaryRow);
  const total = count || 0;

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getPostById(postId: string): Promise<Post | null> {
  const { data: row, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("id", postId)
    .is("deleted_at", null)
    .single();

  if (error || !row) return null;
  return mapPostRow(row);
}

export async function updatePost(postId: string, authorId: string, data: UpdatePostRequest): Promise<Post> {
  // 소유권 확인
  const { data: existing } = await supabase
    .from("posts")
    .select("author_id, published_at")
    .eq("id", postId)
    .is("deleted_at", null)
    .single();

  if (!existing) throw new Error("Post not found");
  if (existing.author_id !== authorId) throw new Error("Forbidden: Not the author");

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) {
    updateData.content = data.content;
    // 내용 변경 시 요약이 명시적으로 제공되지 않으면 자동 생성
    if (data.summary === undefined) {
      updateData.summary = extractSummary(data.content);
    }
  }
  if (data.summary !== undefined) updateData.summary = data.summary;
  if (data.coverImageUrl !== undefined) updateData.cover_image_url = data.coverImageUrl;
  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === "published" && !existing.published_at) {
      updateData.published_at = new Date().toISOString();
    }
  }

  const { data: row, error } = await supabase
    .from("posts")
    .update(updateData)
    .eq("id", postId)
    .select(POST_SELECT)
    .single();

  if (error) throw new Error(`Failed to update post: ${error.message}`);
  return mapPostRow(row);
}

export async function deletePost(postId: string, authorId: string): Promise<void> {
  const { data: existing } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", postId)
    .is("deleted_at", null)
    .single();

  if (!existing) throw new Error("Post not found");
  if (existing.author_id !== authorId) throw new Error("Forbidden: Not the author");

  const { error } = await supabase
    .from("posts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", postId);

  if (error) throw new Error(`Failed to delete post: ${error.message}`);
}

export async function incrementView(
  postId: string,
  viewerId: string | null,
  viewerIp: string | null,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("increment_post_view", {
    p_post_id: postId,
    p_viewer_id: viewerId,
    p_viewer_ip: viewerIp,
  });

  if (error) {
    console.error("Failed to increment view:", error.message);
    return false;
  }

  return data as boolean;
}

// Row mappers: snake_case → camelCase

function mapPostRow(row: Record<string, unknown>): Post {
  const profiles = row.profiles as Record<string, unknown> | null;
  return {
    id: row.id as string,
    authorId: row.author_id as string,
    title: row.title as string,
    content: row.content as Record<string, unknown>,
    summary: row.summary as string | null,
    coverImageUrl: row.cover_image_url as string | null,
    status: row.status as Post["status"],
    viewsCount: row.views_count as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    publishedAt: row.published_at as string | null,
    deletedAt: row.deleted_at as string | null,
    author: profiles
      ? {
          id: profiles.id as string,
          displayName: profiles.display_name as string | null,
          avatarUrl: profiles.avatar_url as string | null,
        }
      : undefined,
  };
}

function mapPostSummaryRow(row: Record<string, unknown>): PostSummary {
  const profiles = row.profiles as Record<string, unknown> | null;
  return {
    id: row.id as string,
    authorId: row.author_id as string,
    title: row.title as string,
    summary: row.summary as string | null,
    coverImageUrl: row.cover_image_url as string | null,
    status: row.status as PostSummary["status"],
    viewsCount: row.views_count as number,
    createdAt: row.created_at as string,
    publishedAt: row.published_at as string | null,
    author: profiles
      ? {
          id: profiles.id as string,
          displayName: profiles.display_name as string | null,
          avatarUrl: profiles.avatar_url as string | null,
        }
      : undefined,
  };
}
