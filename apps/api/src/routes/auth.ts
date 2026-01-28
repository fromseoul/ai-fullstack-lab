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

// 네이버 관련 타입
interface NaverTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface NaverUserResponse {
  resultcode: string;
  message: string;
  response: {
    id: string;
    nickname?: string;
    profile_image?: string;
    email?: string;
    name?: string;
  };
}

// 네이버 인가 코드로 액세스 토큰 교환
async function getNaverToken(code: string, state: string): Promise<NaverTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.NAVER_CLIENT_ID || "",
    client_secret: process.env.NAVER_CLIENT_SECRET || "",
    code,
    state,
  });

  const response = await fetch("https://nid.naver.com/oauth2.0/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Naver token: ${error}`);
  }

  const data = await response.json();
  return data as NaverTokenResponse;
}

// 네이버 액세스 토큰으로 사용자 정보 조회
async function getNaverUser(accessToken: string): Promise<NaverUserResponse> {
  const response = await fetch("https://openapi.naver.com/v1/nid/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get Naver user info");
  }

  const data = await response.json();
  return data as NaverUserResponse;
}

// POST /api/auth/naver - 네이버 로그인
router.post("/naver", async (req: Request, res: Response) => {
  try {
    const { code, state } = req.body;

    if (!code || !state) {
      res.status(400).json({ error: "Authorization code and state are required" });
      return;
    }

    // 1. 네이버 토큰 획득
    const tokenData = await getNaverToken(code, state);

    // 2. 네이버 사용자 정보 조회
    const naverUser = await getNaverUser(tokenData.access_token);

    if (naverUser.resultcode !== "00") {
      throw new Error(`Naver API error: ${naverUser.message}`);
    }

    const naverEmail = naverUser.response.email;
    const displayName = naverUser.response.nickname || naverUser.response.name;
    const photoURL = naverUser.response.profile_image;

    let uid: string;
    let isLinkedAccount = false;

    // 3. 이메일로 기존 Firebase 사용자 검색
    if (naverEmail) {
      try {
        const existingUser = await adminAuth.getUserByEmail(naverEmail);
        // 기존 사용자가 있으면 해당 계정으로 로그인
        uid = existingUser.uid;
        isLinkedAccount = true;
        console.log(`Naver login linked to existing account: ${uid}`);

        // 프로필 정보 업데이트 (displayName이나 photoURL이 없는 경우에만)
        const updates: { displayName?: string; photoURL?: string } = {};
        if (!existingUser.displayName && displayName) {
          updates.displayName = displayName;
        }
        if (!existingUser.photoURL && photoURL) {
          updates.photoURL = photoURL;
        }
        if (Object.keys(updates).length > 0) {
          await adminAuth.updateUser(uid, updates);
        }
      } catch {
        // 이메일로 찾은 사용자가 없으면 새로 생성
        uid = `naver:${naverUser.response.id}`;
      }
    } else {
      // 이메일이 없으면 네이버 ID로 생성
      uid = `naver:${naverUser.response.id}`;
    }

    // 4. 새 사용자인 경우 생성
    if (!isLinkedAccount) {
      try {
        await adminAuth.getUser(uid);
        // 기존 naver: 사용자가 있으면 업데이트
        await adminAuth.updateUser(uid, { displayName, photoURL });
      } catch {
        // 새 사용자 생성
        await adminAuth.createUser({
          uid,
          email: naverEmail,
          emailVerified: true, // 네이버에서 인증된 이메일
          displayName,
          photoURL,
        });
      }
    }

    // 5. Custom Token 생성
    const customToken = await adminAuth.createCustomToken(uid, {
      provider: "naver",
      naverId: naverUser.response.id,
      linkedAccount: isLinkedAccount,
    });

    res.json({
      customToken,
      user: {
        uid,
        displayName,
        photoURL,
        email: naverEmail,
        isLinkedAccount,
      },
    });
  } catch (error) {
    console.error("Naver auth error:", error);
    res.status(500).json({
      error: "Authentication failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
