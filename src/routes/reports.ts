import { Router, Request, Response } from "express";
import { generateReport } from "../services/export-service";

const router = Router();

router.get("/:type", (req: Request, res: Response) => {
  try {
    const output = generateReport(req.params.type, {
      format: req.query.format as "csv" | "json" | "summary" | undefined,
      category: req.query.category as string | undefined,
      search: req.query.search as string | undefined,
      includeStats: req.query.includeStats === "true",
      includeUsers: req.query.includeUsers === "true",
      userRole: req.query.userRole as string | undefined,
      applyDiscount: req.query.applyDiscount === "true",
      sortBy: req.query.sortBy as "name" | "price" | "stock" | undefined,
      sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      minStock: req.query.minStock ? parseInt(req.query.minStock as string) : undefined,
    });

    if (req.query.format === "csv") {
      res.type("text/csv").send(output);
    } else if (req.query.format === "summary") {
      res.type("text/plain").send(output);
    } else {
      res.type("application/json").send(output);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ success: false, error: message });
  }
});

export default router;
