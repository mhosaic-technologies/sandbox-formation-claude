import { Router, Request, Response } from "express";
import { getAllUsers, getUserProfile, findUsersByRole, updateUser, deleteUser } from "../services/user-service";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const role = req.query.role as string | undefined;
  const users = role ? findUsersByRole(role) : getAllUsers();
  res.json({ success: true, data: users });
});

router.get("/:id/profile", (req: Request, res: Response) => {
  try {
    const profile = getUserProfile(req.params.id);
    res.json({ success: true, data: profile });
  } catch {
    res.status(404).json({ success: false, error: "User not found" });
  }
});

router.patch("/:id", (req: Request, res: Response) => {
  const updated = updateUser(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ success: false, error: "User not found" });
    return;
  }
  res.json({ success: true, data: updated });
});

router.delete("/:id", (req: Request, res: Response) => {
  const deleted = deleteUser(req.params.id);
  if (!deleted) {
    res.status(404).json({ success: false, error: "User not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
