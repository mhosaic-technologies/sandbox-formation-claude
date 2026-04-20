import { Router, Request, Response } from "express";
import { createNotification, sendNotification, markAsRead, getUserNotifications, countUnread } from "../services/notification-service";
const router = Router();
router.post("/", (req: Request, res: Response) => { const { userId, channel, title, body, data } = req.body; if (!userId || !channel || !title || !body) { res.status(400).json({ success: false, error: "Missing fields" }); return; } const n = createNotification(userId, { channel, title, body, data }); res.status(201).json({ success: true, data: n }); });
router.post("/:id/send", (req: Request, res: Response) => { try { const r = sendNotification(req.params.id); if (!r) { res.status(404).json({ success: false, error: "Not found" }); return; } res.json({ success: true, data: r }); } catch (err) { res.status(400).json({ success: false, error: (err as Error).message }); } });
router.patch("/:id/read", (req: Request, res: Response) => { const r = markAsRead(req.params.id); if (!r) { res.status(404).json({ success: false, error: "Not found" }); return; } res.json({ success: true, data: r }); });
router.get("/user/:userId", (req: Request, res: Response) => { const { channel, unreadOnly } = req.query; const n = getUserNotifications(req.params.userId, { channel: channel as any, unreadOnly: unreadOnly === "true" }); res.json({ success: true, data: n }); });
router.get("/user/:userId/count", (req: Request, res: Response) => { res.json({ success: true, data: { unread: countUnread(req.params.userId) } }); });
export default router;
