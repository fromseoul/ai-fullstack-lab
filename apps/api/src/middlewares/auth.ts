import type { Request, Response, NextFunction } from "express";
import { adminAuth } from "../lib/firebase-admin.js";

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
  };
}

/**
 * 필수 인증 미들웨어: 유효한 Firebase ID 토큰이 없으면 401 반환
 */
export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Unauthorized: No token provided" });
    return;
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name as string | undefined,
      photoURL: decodedToken.picture as string | undefined,
    };
    next();
  } catch {
    res.status(401).json({ success: false, error: "Unauthorized: Invalid token" });
  }
};

/**
 * 선택적 인증 미들웨어: 토큰이 있으면 사용자 정보를 설정하지만, 없어도 통과
 * 조회수 추적 등에 사용
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name as string | undefined,
      photoURL: decodedToken.picture as string | undefined,
    };
  } catch {
    // 토큰이 유효하지 않아도 선택적 인증이므로 통과
  }

  next();
};
