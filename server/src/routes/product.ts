import { Router } from "express";
import {
  getBuilderVariants,
  getProductByModelSku,
  getProductsByCategory,
} from "../controllers/productController";

const router = Router();

router.get("/category/:category", getProductsByCategory);

router.get("/model/:modelSku", getProductByModelSku);

router.get("/builder", getBuilderVariants);

export default router;
