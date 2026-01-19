import type { Request, Response, NextFunction } from "express";

// Firebase ID Token 검증 미들웨어
// TODO: Firebase Admin SDK 설정 후 활성화

/*
import { auth } from "../config/firebase.js";

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
*/

// Placeholder middleware (항상 통과)
export const verifyToken = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};
