"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, sendEmailVerification, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

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

      if (currentUser.emailVerified) {
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
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-gray-900">
        <div className="text-center">
          <p className="text-gray-400 mb-4">로그인이 필요합니다.</p>
          <Link href="/login" className="text-primary hover:text-blue-400">
            로그인 페이지로 이동
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-gray-900">
      <div className="w-full max-w-md bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-900/50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">이메일 인증</h1>
          <p className="text-gray-400 mb-2">
            가입하신 이메일로 인증 메일을 보내드렸습니다.
          </p>
          <p className="text-primary font-medium">{user.email}</p>
          <p className="text-gray-500 text-sm mt-2">
            이메일의 인증 링크를 클릭한 후, 아래 버튼을 눌러주세요.
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-green-900/50 border border-green-700 text-green-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-900/50 border border-red-700 text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleCheckVerification}
            className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            인증 완료 확인
          </button>

          <button
            onClick={handleResendEmail}
            disabled={resending}
            className="w-full py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {resending ? "발송 중..." : "인증 이메일 재발송"}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-sm text-gray-500 mb-4">
            이메일이 오지 않나요? 스팸 폴더를 확인해보세요.
          </p>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white text-sm"
          >
            다른 계정으로 로그인
          </button>
        </div>
      </div>
    </div>
  );
}
