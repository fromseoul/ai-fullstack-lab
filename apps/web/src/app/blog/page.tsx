"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { ApiResponse, PaginatedResponse, PostSummary } from "@repo/shared";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";

export default function BlogListPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });
      if (search) params.set("search", search);

      const response = await apiFetch<ApiResponse<PaginatedResponse<PostSummary>>>(
        `/api/v1/posts?${params}`,
      );
      if (response.success && response.data) {
        setPosts(response.data.items);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Box sx={{ p: { xs: 3, md: 6 }, maxWidth: 900, mx: "auto" }}>
      {/* 헤더 */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="white">
          블로그
        </Typography>
        {user && (
          <Button
            component={Link}
            href="/blog/write"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            글쓰기
          </Button>
        )}
      </Box>

      {/* 검색 */}
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="게시글 검색..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="disabled" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* 로딩 */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography color="text.secondary">로딩 중...</Typography>
        </Box>
      ) : posts.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center", bgcolor: "grey.800", border: 1, borderColor: "grey.700" }}>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            {search ? "검색 결과가 없습니다." : "아직 게시글이 없습니다."}
          </Typography>
          {user && !search && (
            <Button component={Link} href="/blog/write" color="primary">
              첫 게시글을 작성해보세요
            </Button>
          )}
        </Paper>
      ) : (
        <>
          {/* 게시글 목록 */}
          <Grid container spacing={2}>
            {posts.map((post) => (
              <Grid key={post.id} size={12}>
                <Paper
                  component={Link}
                  href={`/blog/${post.id}`}
                  sx={{
                    p: 3,
                    bgcolor: "grey.800",
                    border: 1,
                    borderColor: "grey.700",
                    display: "block",
                    textDecoration: "none",
                    transition: "border-color 0.2s",
                    "&:hover": { borderColor: "primary.main" },
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" color="white" gutterBottom>
                    {post.title}
                  </Typography>
                  {post.summary && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {post.summary}
                    </Typography>
                  )}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        src={post.author?.avatarUrl || undefined}
                        sx={{ width: 24, height: 24, bgcolor: "grey.700" }}
                      >
                        {!post.author?.avatarUrl && <PersonIcon sx={{ fontSize: 16 }} />}
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">
                        {post.author?.displayName || "익명"}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <VisibilityIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        {post.viewsCount}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
