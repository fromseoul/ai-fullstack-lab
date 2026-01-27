"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import PersonIcon from "@mui/icons-material/Person";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const statusItems = [
  { name: "Frontend: Next.js", active: true },
  { name: "Backend: Express", active: true },
  { name: "Auth: Firebase", active: true },
  { name: "DB: Supabase", active: true },
];

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const isSocialLogin =
          currentUser.uid.startsWith("kakao:") ||
          currentUser.providerData.some(p => p.providerId === "google.com");

        if (!isSocialLogin && !currentUser.emailVerified) {
          router.push("/verify-email");
          return;
        }
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          로딩 중...
        </Typography>
      </Box>
    );
  }

  if (user) {
    return (
      <Box sx={{ p: { xs: 3, md: 6 }, maxWidth: 1200, mx: "auto" }}>
        <Typography variant="h5" fontWeight="bold" color="white" gutterBottom>
          대시보드
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {user.displayName || user.email || "사용자"}님, 환영합니다!
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 3, bgcolor: "grey.800", border: 1, borderColor: "grey.700" }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                사용자
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PersonIcon color="primary" />
                <Typography variant="h5" fontWeight="bold" color="white">
                  1
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 3, bgcolor: "grey.800", border: 1, borderColor: "grey.700" }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                API 요청
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BoltIcon color="primary" />
                <Typography variant="h5" fontWeight="bold" color="white">
                  0
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 3, bgcolor: "grey.800", border: 1, borderColor: "grey.700" }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                상태
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircleIcon color="success" />
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  정상
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ bgcolor: "grey.800", border: 1, borderColor: "grey.700" }}>
          <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: "grey.700" }}>
            <Typography variant="h6" fontWeight="semibold" color="white">
              Tech Stack
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
              {statusItems.map((item) => (
                <Grid key={item.name} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: "grey.900",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {item.name}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 3, md: 6 }, maxWidth: 600, mx: "auto" }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h3" fontWeight="bold" color="white" gutterBottom>
          AI Fullstack Lab
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Next.js + Express + Nginx Monorepo
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Button
            component={Link}
            href="/login"
            variant="contained"
            color="primary"
            startIcon={<LoginIcon />}
            size="large"
          >
            로그인
          </Button>
          <Button
            component={Link}
            href="/signup"
            variant="contained"
            color="success"
            startIcon={<PersonAddIcon />}
            size="large"
          >
            회원가입
          </Button>
        </Box>
      </Box>

      <Paper sx={{ bgcolor: "grey.800", border: 1, borderColor: "grey.700" }}>
        <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: "grey.700" }}>
          <Typography variant="h6" fontWeight="semibold" color="white">
            Tech Stack
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {statusItems.map((item) => (
              <Grid key={item.name} size={{ xs: 12, sm: 6 }}>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: "grey.900",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {item.name}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      px: 1,
                      py: 0.5,
                      bgcolor: "rgba(34, 197, 94, 0.1)",
                      color: "success.main",
                      borderRadius: 1,
                    }}
                  >
                    연동됨
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
