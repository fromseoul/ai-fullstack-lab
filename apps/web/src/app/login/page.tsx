"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { initKakao, loginWithKakao, KAKAO_JS_KEY } from "@/lib/kakao";
import { loginWithNaver, NAVER_CLIENT_ID } from "@/lib/naver";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";

const googleProvider = new GoogleAuthProvider();

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    initKakao();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "로그인 실패";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error && "code" in err) {
        const firebaseError = err as { code: string };
        if (firebaseError.code === "auth/popup-closed-by-user") {
          return;
        }
        if (firebaseError.code === "auth/cancelled-popup-request") {
          return;
        }
      }
      setError("Google 로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    if (!KAKAO_JS_KEY) {
      setError("카카오 로그인 설정이 필요합니다.");
      return;
    }
    loginWithKakao();
  };

  const handleNaverLogin = () => {
    if (!NAVER_CLIENT_ID) {
      setError("네이버 로그인 설정이 필요합니다.");
      return;
    }
    loginWithNaver();
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 4rem)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 4,
          bgcolor: "grey.800",
          border: 1,
          borderColor: "grey.700",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" color="white" gutterBottom>
            로그인
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI Fullstack Lab에 오신 것을 환영합니다
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 소셜 로그인 버튼 */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
          {/* Google 로그인 버튼 */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            startIcon={
              googleLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )
            }
            sx={{
              bgcolor: "white",
              color: "grey.800",
              py: 1.5,
              "&:hover": { bgcolor: "grey.100" },
              "&:disabled": { bgcolor: "grey.300" },
            }}
          >
            {googleLoading ? "로그인 중..." : "Google로 로그인"}
          </Button>

          {/* 카카오 로그인 버튼 */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleKakaoLogin}
            startIcon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
                <path d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.82 5.32 4.56 6.73-.14.52-.92 3.34-.95 3.56 0 0-.02.16.08.22.1.06.22.01.22.01.29-.04 3.37-2.2 3.9-2.57.7.1 1.42.15 2.19.15 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
              </svg>
            }
            sx={{
              bgcolor: "#FEE500",
              color: "rgba(0, 0, 0, 0.85)",
              py: 1.5,
              "&:hover": { bgcolor: "#FDD800" },
            }}
          >
            카카오로 로그인
          </Button>

          {/* 네이버 로그인 버튼 */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleNaverLogin}
            startIcon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF">
                <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
              </svg>
            }
            sx={{
              bgcolor: "#03C75A",
              color: "white",
              py: 1.5,
              "&:hover": { bgcolor: "#02b351" },
            }}
          >
            네이버로 로그인
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            또는
          </Typography>
        </Divider>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "grey.500" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            fullWidth
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "grey.500" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ py: 1.5, mt: 1 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "이메일로 로그인"}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: "center" }}>
          계정이 없으신가요?{" "}
          <Typography
            component={Link}
            href="/signup"
            variant="body2"
            color="primary"
            sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            회원가입
          </Typography>
        </Typography>
      </Paper>
    </Box>
  );
}
