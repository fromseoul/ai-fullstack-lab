"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { ApiResponse, Post } from "@repo/shared";
import CommentsSection from "@/components/blog/CommentsSection";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const postId = params.id as string;

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await apiFetch<ApiResponse<Post>>(`/api/v1/posts/${postId}`);
        if (response.success && response.data) {
          setPost(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "게시글을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
    if (postId) fetchPost();
  }, [postId]);

  const handleDelete = async () => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/v1/posts/${postId}`, { method: "DELETE", requireAuth: true });
      router.push("/blog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isAuthor = user && post && user.uid === post.authorId;

  if (loading) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography color="text.secondary">로딩 중...</Typography>
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box sx={{ p: { xs: 3, md: 6 }, maxWidth: 800, mx: "auto" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "게시글을 찾을 수 없습니다."}
        </Alert>
        <Button component={Link} href="/blog" startIcon={<ArrowBackIcon />}>
          목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  // 콘텐츠 렌더링 (v1: plain text)
  const renderContent = () => {
    if (!post.content) return null;

    // { type: "text", text: "..." } 형식 지원
    if (post.content.type === "text" && typeof post.content.text === "string") {
      return (
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}
        >
          {post.content.text}
        </Typography>
      );
    }

    // JSONB 직접 표시 (fallback)
    return (
      <Typography variant="body1" color="text.primary" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
        {JSON.stringify(post.content, null, 2)}
      </Typography>
    );
  };

  return (
    <Box sx={{ p: { xs: 3, md: 6 }, maxWidth: 800, mx: "auto" }}>
      {/* 뒤로가기 */}
      <Button
        component={Link}
        href="/blog"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, color: "text.secondary" }}
      >
        목록으로
      </Button>

      {/* 게시글 헤더 */}
      <Paper sx={{ p: 4, bgcolor: "grey.800", border: 1, borderColor: "grey.700", mb: 3 }}>
        {post.status === "draft" && (
          <Typography
            variant="caption"
            sx={{
              display: "inline-block",
              px: 1.5,
              py: 0.5,
              bgcolor: "rgba(234, 179, 8, 0.1)",
              color: "warning.main",
              borderRadius: 1,
              mb: 2,
            }}
          >
            임시 저장
          </Typography>
        )}

        <Typography variant="h4" fontWeight="bold" color="white" gutterBottom>
          {post.title}
        </Typography>

        {/* 작성자 정보 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              src={post.author?.avatarUrl || undefined}
              sx={{ width: 32, height: 32, bgcolor: "grey.700" }}
            >
              {!post.author?.avatarUrl && <PersonIcon />}
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              {post.author?.displayName || "익명"}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {formatDate(post.publishedAt || post.createdAt)}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <VisibilityIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {post.viewsCount}
            </Typography>
          </Box>
        </Box>

        {/* 수정/삭제 버튼 (본인만) */}
        {isAuthor && (
          <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
            <Button
              component={Link}
              href={`/blog/${post.id}/edit`}
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
            >
              수정
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "삭제 중..." : "삭제"}
            </Button>
          </Box>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* 본문 */}
        {renderContent()}
      </Paper>

      {/* 댓글 섹션 */}
      <CommentsSection postId={postId} />
    </Box>
  );
}
