"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { ApiResponse, Comment } from "@repo/shared";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

interface Props {
  postId: string;
}

export default function CommentsSection({ postId }: Props) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const fetchComments = useCallback(async () => {
    try {
      const response = await apiFetch<ApiResponse<Comment[]>>(
        `/api/v1/posts/${postId}/comments`,
      );
      if (response.success && response.data) {
        setComments(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      const response = await apiFetch<ApiResponse<Comment>>(
        `/api/v1/posts/${postId}/comments`,
        {
          method: "POST",
          requireAuth: true,
          body: { content: newComment.trim() },
        },
      );
      if (response.success && response.data) {
        setComments((prev) => [...prev, response.data!]);
        setNewComment("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "댓글 작성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (commentId: string) => {
    if (!editContent.trim()) return;
    setError("");

    try {
      const response = await apiFetch<ApiResponse<Comment>>(
        `/api/v1/comments/${commentId}`,
        {
          method: "PUT",
          requireAuth: true,
          body: { content: editContent.trim() },
        },
      );
      if (response.success && response.data) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? response.data! : c)),
        );
        setEditingId(null);
        setEditContent("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "댓글 수정에 실패했습니다.");
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    setError("");

    try {
      await apiFetch(`/api/v1/comments/${commentId}`, {
        method: "DELETE",
        requireAuth: true,
      });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "댓글 삭제에 실패했습니다.");
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Paper sx={{ p: 3, bgcolor: "grey.800", border: 1, borderColor: "grey.700" }}>
      <Typography variant="h6" fontWeight="bold" color="white" sx={{ mb: 3 }}>
        댓글 {comments.length > 0 && `(${comments.length})`}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 댓글 작성 */}
      {user ? (
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="댓글을 입력하세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            multiline
            rows={3}
            slotProps={{ htmlInput: { maxLength: 2000 } }}
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleSubmit}
              disabled={submitting || !newComment.trim()}
              endIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            >
              작성
            </Button>
          </Box>
        </Box>
      ) : (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            bgcolor: "grey.900",
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            댓글을 작성하려면 로그인이 필요합니다.
          </Typography>
        </Paper>
      )}

      {/* 댓글 목록 */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      ) : comments.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          아직 댓글이 없습니다.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {comments.map((comment) => (
            <Box
              key={comment.id}
              sx={{
                p: 2,
                bgcolor: "grey.900",
                borderRadius: 1,
              }}
            >
              {/* 댓글 헤더 */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    src={comment.author?.avatarUrl || undefined}
                    sx={{ width: 24, height: 24, bgcolor: "grey.700" }}
                  >
                    {!comment.author?.avatarUrl && <PersonIcon sx={{ fontSize: 16 }} />}
                  </Avatar>
                  <Typography variant="body2" fontWeight="medium" color="text.primary">
                    {comment.author?.displayName || "익명"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(comment.createdAt)}
                  </Typography>
                </Box>

                {/* 수정/삭제 (본인만) */}
                {user && user.uid === comment.authorId && editingId !== comment.id && (
                  <Box>
                    <IconButton size="small" onClick={() => startEdit(comment)}>
                      <EditIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(comment.id)}>
                      <DeleteIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {/* 댓글 내용 / 수정 폼 */}
              {editingId === comment.id ? (
                <Box>
                  <TextField
                    fullWidth
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    multiline
                    rows={2}
                    size="small"
                    slotProps={{ htmlInput: { maxLength: 2000 } }}
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button size="small" variant="contained" onClick={() => handleUpdate(comment.id)}>
                      수정
                    </Button>
                    <Button size="small" onClick={cancelEdit} startIcon={<CloseIcon />}>
                      취소
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "pre-wrap" }}>
                  {comment.content}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}
