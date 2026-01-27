import { Router, Request, Response } from "express";
import { adminAuth } from "../lib/firebase-admin";

const router: import("express").Router = Router();

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

interface KakaoUserResponse {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

// 카카오 인가 코드로 액세스 토큰 교환
async function getKakaoToken(code: string): Promise<KakaoTokenResponse> {
  const params: Record<string, string> = {
    grant_type: "authorization_code",
    client_id: process.env.KAKAO_REST_API_KEY || "",
    redirect_uri: process.env.KAKAO_REDIRECT_URI || "http://localhost:3000/auth/kakao/callback",
    code,
  };

  // Client Secret이 설정된 경우 추가
  if (process.env.KAKAO_CLIENT_SECRET) {
    params.client_secret = process.env.KAKAO_CLIENT_SECRET;
  }

  const response = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Kakao token: ${error}`);
  }

  // Ensure the response is typed as KakaoTokenResponse
  const data = await response.json();
  return data as KakaoTokenResponse;
}

// 카카오 액세스 토큰으로 사용자 정보 조회
async function getKakaoUser(accessToken: string): Promise<KakaoUserResponse> {
  const response = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get Kakao user info");
  }

  // Ensure the response is typed as KakaoUserResponse
  const data = await response.json();
  return data as KakaoUserResponse;
}

// POST /api/auth/kakao - 카카오 로그인
router.post("/kakao", async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ error: "Authorization code is required" });
      return;
    }

    // 1. 카카오 토큰 획득
    const tokenData = await getKakaoToken(code);

    // 2. 카카오 사용자 정보 조회
    const kakaoUser = await getKakaoUser(tokenData.access_token);

    // 3. Firebase 사용자 생성/업데이트
    const uid = `kakao:${kakaoUser.id}`;
    const displayName = kakaoUser.kakao_account?.profile?.nickname;
    const photoURL = kakaoUser.kakao_account?.profile?.profile_image_url;

    try {
      // 기존 사용자가 있으면 업데이트
      await adminAuth.getUser(uid);
      await adminAuth.updateUser(uid, { displayName, photoURL });
    } catch {
      // 새 사용자 생성
      await adminAuth.createUser({
        uid,
        displayName,
        photoURL,
      });
    }

    // 4. Custom Token 생성
    const customToken = await adminAuth.createCustomToken(uid, {
      provider: "kakao",
      kakaoId: kakaoUser.id,
    });

    res.json({
      customToken,
      user: {
        uid,
        displayName,
        photoURL,
      },
    });
  } catch (error) {
    console.error("Kakao auth error:", error);
    res.status(500).json({
      error: "Authentication failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
