import { Router, type Router as RouterType } from "express";
import { verifyToken } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import * as profileController from "../controllers/profile.controller.js";

const router: RouterType = Router();

router.get("/me", verifyToken, profileController.getMyProfile);

router.put(
  "/me",
  verifyToken,
  validate([
    { field: "displayName", type: "string", maxLength: 50 },
    { field: "bio", type: "string", maxLength: 500 },
  ]),
  profileController.updateMyProfile,
);

export default router;
