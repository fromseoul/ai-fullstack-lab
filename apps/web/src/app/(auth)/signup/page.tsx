"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

const googleProvider = new GoogleAuthProvider();

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    initKakao();
  }, []);

  const passwordValidation = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasLetter: /[a-zA-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
  }, [password]);

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const validatePassword = () => {
    if (!passwordValidation.minLength) {
      return "비밀번호는 8자 이상이어야 합니다";
    }
    if (!passwordValidation.hasLetter) {
      return "비밀번호에 영문자를 포함해야 합니다";
    }
    if (!passwordValidation.hasNumber) {
      return "비밀번호에 숫자를 포함해야 합니다";
    }
    if (!passwordValidation.hasSpecial) {
      return "비밀번호에 특수문자를 포함해야 합니다";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      try {
        await sendEmailVerification(userCredential.user);
      } catch (emailErr) {
        console.error("Email verification send error:", emailErr);
      }

      router.push("/verify-email");
    } catch (err: unknown) {
      if (err instanceof Error && "code" in err) {
        const firebaseError = err as { code: string };
        switch (firebaseError.code) {
          case "auth/email-already-in-use":
            setError("이미 사용 중인 이메일입니다");
            break;
          case "auth/invalid-email":
            setError("올바른 이메일 형식이 아닙니다");
            break;
          case "auth/weak-password":
            setError("비밀번호가 너무 약합니다");
            break;
          default:
            setError("회원가입에 실패했습니다. 다시 시도해주세요");
        }
      } else {
        setError("회원가입에 실패했습니다. 다시 시도해주세요");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
      setError("Google 회원가입에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleKakaoSignup = () => {
    if (!KAKAO_JS_KEY) {
      setError("카카오 로그인 설정이 필요합니다.");
      return;
    }
    loginWithKakao();
  };

  const handleNaverSignup = () => {
    if (!NAVER_CLIENT_ID) {
      setError("네이버 로그인 설정이 필요합니다.");
      return;
    }
    loginWithNaver();
  };

  const ValidationItem = ({ valid, text }: { valid: boolean; text: string }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {valid ? (
        <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
      ) : (
        <CancelIcon sx={{ fontSize: 16, color: "grey.500" }} />
      )}
      <Typography variant="caption" color={valid ? "success.main" : "text.secondary"}>
        {text}
      </Typography>
    </Box>
  );

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
            회원가입
          </Typography>
          <Typography variant="body2" color="text.secondary">
            새 계정을 만들어보세요
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 소셜 회원가입 버튼 */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleGoogleSignup}
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
            {googleLoading ? "가입 중..." : "Google로 가입"}
          </Button>

          <Button
            fullWidth
            variant="contained"
            onClick={handleKakaoSignup}
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
            카카오로 가입
          </Button>

          <Button
            fullWidth
            variant="contained"
            onClick={handleNaverSignup}
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
            네이버로 가입
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            또는 이메일로 가입
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

          <Box>
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
            {password && (
              <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                <ValidationItem valid={passwordValidation.minLength} text="8자 이상" />
                <ValidationItem valid={passwordValidation.hasLetter} text="영문자 포함" />
                <ValidationItem valid={passwordValidation.hasNumber} text="숫자 포함" />
                <ValidationItem valid={passwordValidation.hasSpecial} text="특수문자 포함 (!@#$%^&* 등)" />
              </Box>
            )}
          </Box>

          <Box>
            <TextField
              fullWidth
              label="비밀번호 확인"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호 확인"
              required
              error={!!confirmPassword && password !== confirmPassword}
              helperText={confirmPassword && password !== confirmPassword ? "비밀번호가 일치하지 않습니다" : ""}
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
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading || !isPasswordValid || password !== confirmPassword}
            sx={{ py: 1.5, mt: 1 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "회원가입"}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: "center" }}>
          이미 계정이 있으신가요?{" "}
          <Typography
            component={Link}
            href="/login"
            variant="body2"
            color="primary"
            sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            로그인
          </Typography>
        </Typography>
      </Paper>
    </Box>
  );
}
