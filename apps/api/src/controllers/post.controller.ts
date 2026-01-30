import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.js";
import * as postService from "../services/post.service.js";
import { getOrCreateProfile } from "../services/profile.service.js";
import type { ApiResponse, Post, PostSummary, PostListParams, PaginatedResponse } from "@repo/shared";

export async function createPost(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" } satisfies ApiResponse);
      return;
    }

    // 프로필이 없으면 자동 생성 (Firebase 사용자 정보 포함)
    await getOrCreateProfile(req.user.uid, req.user.email, req.user.displayName, req.user.photoURL);

    const post = await postService.createPost(req.user.uid, req.body);
    res.status(201).json({ success: true, data: post } satisfies ApiResponse<Post>);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: message } satisfies ApiResponse);
  }
}

export async function listPosts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const params: PostListParams = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sortBy: req.query.sortBy as PostListParams["sortBy"],
      sortOrder: req.query.sortOrder as PostListParams["sortOrder"],
      status: req.query.status as PostListParams["status"],
      authorId: req.query.authorId as string | undefined,
      search: req.query.search as string | undefined,
    };

    // 본인 글이 아닌 draft는 볼 수 없음
    if (params.status === "draft" && params.authorId !== req.user?.uid) {
      params.status = "published";
    }

    const result = await postService.listPosts(params);
    res.json({ success: true, data: result } satisfies ApiResponse<PaginatedResponse<PostSummary>>);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: message } satisfies ApiResponse);
  }
}

export async function getPost(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const post = await postService.getPostById(id);

    if (!post) {
      res.status(404).json({ success: false, error: "Post not found" } satisfies ApiResponse);
      return;
    }

    // draft 게시글은 본인만 볼 수 있음
    if (post.status === "draft" && post.authorId !== req.user?.uid) {
      res.status(404).json({ success: false, error: "Post not found" } satisfies ApiResponse);
      return;
    }

    // 조회수 증가 (비동기, fire-and-forget)
    const viewerIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      null;
    postService.incrementView(id, req.user?.uid || null, viewerIp).catch(() => {});

    res.json({ success: true, data: post } satisfies ApiResponse<Post>);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: message } satisfies ApiResponse);
  }
}

export async function updatePost(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" } satisfies ApiResponse);
      return;
    }

    const id = req.params.id as string;
    const post = await postService.updatePost(id, req.user.uid, req.body);
    res.json({ success: true, data: post } satisfies ApiResponse<Post>);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Post not found") {
      res.status(404).json({ success: false, error: message } satisfies ApiResponse);
    } else if (message.startsWith("Forbidden")) {
      res.status(403).json({ success: false, error: message } satisfies ApiResponse);
    } else {
      res.status(500).json({ success: false, error: message } satisfies ApiResponse);
    }
  }
}

export async function deletePost(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" } satisfies ApiResponse);
      return;
    }

    const id = req.params.id as string;
    await postService.deletePost(id, req.user.uid);
    res.json({ success: true, message: "Post deleted" } satisfies ApiResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Post not found") {
      res.status(404).json({ success: false, error: message } satisfies ApiResponse);
    } else if (message.startsWith("Forbidden")) {
      res.status(403).json({ success: false, error: message } satisfies ApiResponse);
    } else {
      res.status(500).json({ success: false, error: message } satisfies ApiResponse);
    }
  }
}
