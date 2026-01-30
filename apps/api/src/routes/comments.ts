import { Router } from "express";
import { verifyToken } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import * as commentController from "../controllers/comment.controller.js";

const router: import("express").Router = Router();

router.put(
  "/:id",
  verifyToken,
  validate([
    { field: "content", required: true, type: "string", minLength: 1, maxLength: 2000 },
  ]),
  commentController.updateComment,
);

router.delete("/:id", verifyToken, commentController.deleteComment);

export default router;
