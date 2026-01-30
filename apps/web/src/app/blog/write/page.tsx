"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { ApiResponse, Post } from "@repo/shared";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import PublishIcon from "@mui/icons-material/Publish";

export default function BlogWritePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (authLoading) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography color="text.secondary">로딩 중...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: { xs: 3, md: 6 }, maxWidth: 800, mx: "auto" }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          로그인이 필요합니다.
        </Alert>
        <Button component={Link} href="/login" variant="contained">
          로그인
        </Button>
      </Box>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await apiFetch<ApiResponse<Post>>("/api/v1/posts", {
        method: "POST",
        requireAuth: true,
        body: {
          title: title.trim(),
          content: { type: "text", text: content },
          status,
        },
      });

      if (response.success && response.data) {
        router.push(`/blog/${response.data.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "게시글 작성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 3, md: 6 }, maxWidth: 800, mx: "auto" }}>
      <Button
        component={Link}
        href="/blog"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, color: "text.secondary" }}
      >
        목록으로
      </Button>

      <Typography variant="h4" fontWeight="bold" color="white" sx={{ mb: 4 }}>
        새 게시글 작성
      </Typography>

      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: 4, bgcolor: "grey.800", border: 1, borderColor: "grey.700" }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 3 }}
          slotProps={{ htmlInput: { maxLength: 200 } }}
        />

        <TextField
          fullWidth
          label="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          multiline
          rows={15}
          sx={{ mb: 3 }}
        />

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            상태
          </Typography>
          <ToggleButtonGroup
            value={status}
            exclusive
            onChange={(_, value) => value && setStatus(value)}
            size="small"
          >
            <ToggleButton value="published">
              <PublishIcon sx={{ mr: 0.5, fontSize: 18 }} />
              발행
            </ToggleButton>
            <ToggleButton value="draft">
              <SaveIcon sx={{ mr: 0.5, fontSize: 18 }} />
              임시 저장
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
            sx={{ minWidth: 120 }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : status === "published" ? "발행하기" : "저장하기"}
          </Button>
          <Button
            component={Link}
            href="/blog"
            variant="outlined"
            color="inherit"
          >
            취소
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
