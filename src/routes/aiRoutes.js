import { Router } from "express";
import * as aiController from "../controllers/aiController.js";

const router = Router();

router.get("/documents", aiController.listDocuments);
router.all("/search", aiController.search);

export default router;
