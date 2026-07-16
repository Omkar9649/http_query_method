import { Router } from "express";
import * as productController from "../controllers/productController.js";

const router = Router();

router.get("/", productController.getAll);
router.post("/search", productController.searchWithPost);
router.all("/query", productController.query);

export default router;
