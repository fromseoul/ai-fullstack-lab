import { supabase } from "../config/supabase.js";
import type { Comment, CreateCommentRequest, UpdateCommentRequest } from "@repo/shared";

const COMMENT_SELECT = `
  id, post_id, author_id, parent_id, content,
  created_at, updated_at, deleted_at,
  profiles!comments_author_id_fkey ( id, display_name, avatar_url )
`;

export async function createComment(
  postId: string,
  authorId: string,
  data: CreateCommentRequest,
): Promise<Comment> {
  // 게시글 존재 확인
  const { data: post } = await supabase
    .from("posts")
    .select("id")
    .eq("id", postId)
    .is("deleted_at", null)
    .single();

  if (!post) throw new Error("Post not found");

  const { data: row, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      author_id: authorId,
      parent_id: data.parentId || null,
      content: data.content,
    })
    .select(COMMENT_SELECT)
    .single();

  if (error) throw new Error(`Failed to create comment: ${error.message}`);
  return mapCommentRow(row);
}

export async function listComments(postId: string): Promise<Comment[]> {
  const { data: rows, error } = await supabase
    .from("comments")
    .select(COMMENT_SELECT)
    .eq("post_id", postId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to list comments: ${error.message}`);
  return (rows || []).map(mapCommentRow);
}

export async function updateComment(
  commentId: string,
  authorId: string,
  data: UpdateCommentRequest,
): Promise<Comment> {
  // 소유권 확인
  const { data: existing } = await supabase
    .from("comments")
    .select("author_id")
    .eq("id", commentId)
    .is("deleted_at", null)
    .single();

  if (!existing) throw new Error("Comment not found");
  if (existing.author_id !== authorId) throw new Error("Forbidden: Not the author");

  const { data: row, error } = await supabase
    .from("comments")
    .update({ content: data.content })
    .eq("id", commentId)
    .select(COMMENT_SELECT)
    .single();

  if (error) throw new Error(`Failed to update comment: ${error.message}`);
  return mapCommentRow(row);
}

export async function deleteComment(commentId: string, authorId: string): Promise<void> {
  const { data: existing } = await supabase
    .from("comments")
    .select("author_id")
    .eq("id", commentId)
    .is("deleted_at", null)
    .single();

  if (!existing) throw new Error("Comment not found");
  if (existing.author_id !== authorId) throw new Error("Forbidden: Not the author");

  const { error } = await supabase
    .from("comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", commentId);

  if (error) throw new Error(`Failed to delete comment: ${error.message}`);
}

function mapCommentRow(row: Record<string, unknown>): Comment {
  const profiles = row.profiles as Record<string, unknown> | null;
  return {
    id: row.id as string,
    postId: row.post_id as string,
    authorId: row.author_id as string,
    parentId: row.parent_id as string | null,
    content: row.content as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
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
