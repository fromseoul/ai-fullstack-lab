import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.js";
import * as profileService from "../services/profile.service.js";
import type { ApiResponse, Profile } from "@repo/shared";

export async function getMyProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" } satisfies ApiResponse);
      return;
    }

    const profile = await profileService.getOrCreateProfile(
      req.user.uid, req.user.email, req.user.displayName, req.user.photoURL,
    );
    res.json({ success: true, data: profile } satisfies ApiResponse<Profile>);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: message } satisfies ApiResponse);
  }
}

export async function updateMyProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" } satisfies ApiResponse);
      return;
    }

    await profileService.getOrCreateProfile(
      req.user.uid, req.user.email, req.user.displayName, req.user.photoURL,
    );

    const profile = await profileService.updateProfile(req.user.uid, req.body);
    res.json({ success: true, data: profile } satisfies ApiResponse<Profile>);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: message } satisfies ApiResponse);
  }
}
