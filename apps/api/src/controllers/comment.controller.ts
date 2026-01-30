import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.js";
import * as commentService from "../services/comment.service.js";
import { getOrCreateProfile } from "../services/profile.service.js";
import type { ApiResponse, Comment } from "@repo/shared";

export async function createComment(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" } satisfies ApiResponse);
      return;
    }

    await getOrCreateProfile(req.user.uid, req.user.email, req.user.displayName, req.user.photoURL);

    const postId = req.params.postId as string;
    const comment = await commentService.createComment(postId, req.user.uid, req.body);
    res.status(201).json({ success: true, data: comment } satisfies ApiResponse<Comment>);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Post not found") {
      res.status(404).json({ success: false, error: message } satisfies ApiResponse);
    } else {
      res.status(500).json({ success: false, error: message } satisfies ApiResponse);
    }
  }
}

export async function listComments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const postId = req.params.postId as string;
    const comments = await commentService.listComments(postId);
    res.json({ success: true, data: comments } satisfies ApiResponse<Comment[]>);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: message } satisfies ApiResponse);
  }
}

export async function updateComment(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" } satisfies ApiResponse);
      return;
    }

    const id = req.params.id as string;
    const comment = await commentService.updateComment(id, req.user.uid, req.body);
    res.json({ success: true, data: comment } satisfies ApiResponse<Comment>);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Comment not found") {
      res.status(404).json({ success: false, error: message } satisfies ApiResponse);
    } else if (message.startsWith("Forbidden")) {
      res.status(403).json({ success: false, error: message } satisfies ApiResponse);
    } else {
      res.status(500).json({ success: false, error: message } satisfies ApiResponse);
    }
  }
}

export async function deleteComment(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" } satisfies ApiResponse);
      return;
    }

    const id = req.params.id as string;
    await commentService.deleteComment(id, req.user.uid);
    res.json({ success: true, message: "Comment deleted" } satisfies ApiResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Comment not found") {
      res.status(404).json({ success: false, error: message } satisfies ApiResponse);
    } else if (message.startsWith("Forbidden")) {
      res.status(403).json({ success: false, error: message } satisfies ApiResponse);
    } else {
      res.status(500).json({ success: false, error: message } satisfies ApiResponse);
    }
  }
}
