import { Router, type Router as RouterType } from "express";
import { verifyToken, optionalAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import * as postController from "../controllers/post.controller.js";
import * as commentController from "../controllers/comment.controller.js";

const router: RouterType = Router();

// 게시글 CRUD
router.post(
  "/",
  verifyToken,
  validate([
    { field: "title", required: true, type: "string", minLength: 1, maxLength: 200 },
    { field: "content", required: true, type: "object" },
  ]),
  postController.createPost,
);

router.get("/", optionalAuth, postController.listPosts);

router.get("/:id", optionalAuth, postController.getPost);

router.put(
  "/:id",
  verifyToken,
  validate([{ field: "title", type: "string", maxLength: 200 }]),
  postController.updatePost,
);

router.delete("/:id", verifyToken, postController.deletePost);

// 게시글의 댓글
router.post(
  "/:postId/comments",
  verifyToken,
  validate([
    { field: "content", required: true, type: "string", minLength: 1, maxLength: 2000 },
  ]),
  commentController.createComment,
);

router.get("/:postId/comments", commentController.listComments);

export default router;
