import { Router, Request, Response } from "express";
import { getAllProducts, getProductById, searchProducts, getProductsByCategory } from "../services/product-service";
import { paginate } from "../utils/pagination";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  let products = getAllProducts();

  if (typeof req.query.search === "string") {
    products = searchProducts(req.query.search);
  } else if (typeof req.query.category === "string") {
    products = getProductsByCategory(req.query.category);
  }

  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  const result = paginate(products, page, pageSize);
  res.json({ success: true, data: result });
});

router.get("/:id", (req: Request, res: Response) => {
  const product = getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ success: false, error: "Product not found" });
    return;
  }
  res.json({ success: true, data: product });
});

export default router;
