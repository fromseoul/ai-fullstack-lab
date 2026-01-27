"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";

function KakaoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError("카카오 로그인이 취소되었습니다.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    if (!code) {
      setError("인가 코드가 없습니다.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    // 백엔드로 인가 코드 전송
    const authenticateWithKakao = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(`${apiUrl}/api/v1/auth/kakao`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "카카오 인증에 실패했습니다.");
        }

        const { customToken } = await response.json();

        // Firebase Custom Token으로 로그인
        await signInWithCustomToken(auth, customToken);

        router.push("/");
      } catch (err) {
        console.error("Kakao auth error:", err);
        setError(err instanceof Error ? err.message : "카카오 로그인에 실패했습니다.");
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    authenticateWithKakao();
  }, [searchParams, router]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-gray-900">
      <div className="text-center">
        {error ? (
          <div className="text-red-400">
            <p className="text-lg mb-2">{error}</p>
            <p className="text-sm text-gray-500">로그인 페이지로 이동합니다...</p>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">카카오 로그인 처리 중...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KakaoCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-gray-900">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">로딩 중...</p>
          </div>
        </div>
      }
    >
      <KakaoCallbackContent />
    </Suspense>
  );
}
