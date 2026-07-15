import { Router } from "express";
import aiRoutes from "./aiRoutes.js";

const router = Router();

router.use("/ai", aiRoutes);

export default router;
