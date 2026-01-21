import { Router, type Router as RouterType } from "express";

const router: RouterType = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "api",
    version: "0.1.0",
  });
});

export default router;
