// Kakao SDK Types
declare global {
  interface Window {
    Kakao: {
      init: (appKey: string) => void;
      isInitialized: () => boolean;
      Auth: {
        authorize: (options: { redirectUri: string }) => void;
        setAccessToken: (token: string) => void;
        getAccessToken: () => string | null;
        logout: () => Promise<void>;
      };
      API: {
        request: (options: {
          url: string;
          success?: (response: KakaoUserResponse) => void;
          fail?: (error: Error) => void;
        }) => void;
      };
    };
  }
}

export interface KakaoUserResponse {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

export const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "";
export const KAKAO_REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || "http://localhost:3000/auth/kakao/callback";

export const initKakao = () => {
  if (typeof window !== "undefined" && window.Kakao && !window.Kakao.isInitialized() && KAKAO_JS_KEY) {
    window.Kakao.init(KAKAO_JS_KEY);
  }
};

export const loginWithKakao = () => {
  if (typeof window === "undefined" || !window.Kakao) return;

  if (!window.Kakao.isInitialized()) {
    initKakao();
  }

  window.Kakao.Auth.authorize({
    redirectUri: KAKAO_REDIRECT_URI,
  });
};
