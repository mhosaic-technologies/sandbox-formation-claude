import { Router, Request, Response } from "express";
import { createOrder, getOrder, getUserOrders, updateOrderStatus } from "../services/order-service";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, items } = req.body;
    if (!userId || !items || !Array.isArray(items)) {
      res.status(400).json({ success: false, error: "userId and items are required" });
      return;
    }
    const order = await createOrder(userId, items);
    res.status(201).json({ success: true, data: order });
  } catch {
    res.status(500).json({ success: false, error: "Failed to create order" });
  }
});

router.get("/:id", (req: Request, res: Response) => {
  const order = getOrder(req.params.id);
  if (!order) {
    res.status(404).json({ success: false, error: "Order not found" });
    return;
  }
  res.json({ success: true, data: order });
});

router.get("/user/:userId", (req: Request, res: Response) => {
  const orders = getUserOrders(req.params.userId);
  res.json({ success: true, data: orders });
});

router.patch("/:id/status", (req: Request, res: Response) => {
  const { status } = req.body;
  const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  if (!status || !validStatuses.includes(status)) { res.status(400).json({ success: false, error: "Invalid status" }); return; }
  const updated = updateOrderStatus(req.params.id, status);
  if (!updated) {
    res.status(404).json({ success: false, error: "Order not found" });
    return;
  }
  res.json({ success: true, data: updated });
});

export default router;
