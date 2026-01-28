export const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "";
export const NAVER_REDIRECT_URI = process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI || "http://localhost:3000/auth/naver/callback";

export const loginWithNaver = () => {
  if (typeof window === "undefined" || !NAVER_CLIENT_ID) return;

  // CSRF 방지를 위한 state 생성
  const state = Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem("naver_oauth_state", state);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: NAVER_CLIENT_ID,
    redirect_uri: NAVER_REDIRECT_URI,
    state,
  });

  window.location.href = `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
};
