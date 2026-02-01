"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

function NaverCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError("네이버 로그인이 취소되었습니다.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    if (!code || !state) {
      setError("인가 코드가 없습니다.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    // CSRF 검증
    const savedState = sessionStorage.getItem("naver_oauth_state");
    if (state !== savedState) {
      setError("보안 검증에 실패했습니다. 다시 시도해주세요.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    // state 삭제
    sessionStorage.removeItem("naver_oauth_state");

    const authenticateWithNaver = async () => {
      try {
        const response = await fetch("/api/v1/auth/naver", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "네이버 인증에 실패했습니다.");
        }

        const { customToken } = await response.json();

        await signInWithCustomToken(auth, customToken);

        router.push("/");
      } catch (err) {
        console.error("Naver auth error:", err);
        setError(err instanceof Error ? err.message : "네이버 로그인에 실패했습니다.");
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    authenticateWithNaver();
  }, [searchParams, router]);

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
        {error ? (
          <>
            <Typography color="error" variant="h6" sx={{ mb: 1 }}>
              {error}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              로그인 페이지로 이동합니다...
            </Typography>
          </>
        ) : (
          <>
            <CircularProgress sx={{ mb: 2, color: "#03C75A" }} />
            <Typography color="text.secondary">네이버 로그인 처리 중...</Typography>
          </>
        )}
      </Box>
    </Box>
  );
}

export default function NaverCallbackPage() {
  return (
    <Suspense
      fallback={
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
            <CircularProgress sx={{ mb: 2, color: "#03C75A" }} />
            <Typography color="text.secondary">로딩 중...</Typography>
          </Box>
        </Box>
      }
    >
      <NaverCallbackContent />
    </Suspense>
  );
}
