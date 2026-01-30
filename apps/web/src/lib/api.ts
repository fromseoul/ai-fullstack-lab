import { auth } from "./firebase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  requireAuth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { body, requireAuth = false, ...init } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> || {}),
  };

  // Firebase ID 토큰 자동 주입
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    } catch {
      if (requireAuth) throw new Error("Failed to get auth token");
    }
  } else if (requireAuth) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}
