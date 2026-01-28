"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, sendEmailVerification, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import EmailIcon from "@mui/icons-material/Email";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(false);

      if (!currentUser) {
        router.push("/login");
        return;
      }

      const isSocialLogin =
        currentUser.uid.startsWith("kakao:") ||
        currentUser.uid.startsWith("naver:") ||
        currentUser.providerData.some(p => p.providerId === "google.com");

      if (isSocialLogin || currentUser.emailVerified) {
        router.push("/");
        return;
      }

      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [router]);

  const handleResendEmail = useCallback(async () => {
    if (!user) return;
    setResending(true);
    setMessage("");
    setError("");

    try {
      await sendEmailVerification(user);
      setMessage("인증 이메일이 발송되었습니다. 이메일을 확인해주세요.");
    } catch (err: unknown) {
      console.error("Email verification error:", err);
      if (err instanceof Error && "code" in err) {
        const firebaseError = err as { code: string };
        if (firebaseError.code === "auth/too-many-requests") {
          setError("너무 많은 요청이 있었습니다. 잠시 후 다시 시도해주세요.");
        } else {
          setError("이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
      } else {
        setError("이메일 발송에 실패했습니다.");
      }
    } finally {
      setResending(false);
    }
  }, [user]);

  const handleCheckVerification = async () => {
    if (!user) return;
    setMessage("");
    setError("");

    try {
      await user.reload();
      const refreshedUser = auth.currentUser;
      if (refreshedUser?.emailVerified) {
        router.push("/");
      } else {
        setError("아직 이메일 인증이 완료되지 않았습니다.");
      }
    } catch (err) {
      console.error("Reload error:", err);
      setError("확인 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
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
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography color="text.secondary">로딩 중...</Typography>
        </Box>
      </Box>
    );
  }

  if (!user) {
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
        <Box sx={{ textAlign: "center" }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            로그인이 필요합니다.
          </Typography>
          <Typography
            component={Link}
            href="/login"
            color="primary"
            sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            로그인 페이지로 이동
          </Typography>
        </Box>
      </Box>
    );
  }

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
          textAlign: "center",
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              mx: "auto",
              mb: 2,
              bgcolor: "rgba(59, 130, 246, 0.1)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <EmailIcon sx={{ fontSize: 32, color: "primary.main" }} />
          </Box>
          <Typography variant="h5" fontWeight="bold" color="white" gutterBottom>
            이메일 인증
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            가입하신 이메일로 인증 메일을 보내드렸습니다.
          </Typography>
          <Typography color="primary" fontWeight="medium">
            {user.email}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            이메일의 인증 링크를 클릭한 후, 아래 버튼을 눌러주세요.
          </Typography>
        </Box>

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleCheckVerification}
            sx={{ py: 1.5 }}
          >
            인증 완료 확인
          </Button>

          <Button
            fullWidth
            variant="contained"
            onClick={handleResendEmail}
            disabled={resending}
            sx={{
              py: 1.5,
              bgcolor: "grey.700",
              "&:hover": { bgcolor: "grey.600" },
            }}
          >
            {resending ? <CircularProgress size={24} color="inherit" /> : "인증 이메일 재발송"}
          </Button>
        </Box>

        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: "grey.700" }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            이메일이 오지 않나요? 스팸 폴더를 확인해보세요.
          </Typography>
          <Button
            variant="text"
            onClick={handleLogout}
            sx={{ color: "text.secondary", "&:hover": { color: "white" } }}
          >
            다른 계정으로 로그인
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
