import { Notification, CreateNotificationInput, NotificationChannel } from "../types";
const notifications: Map<string, Notification> = new Map();
let counter = 0;
export function createNotification(userId: string, input: CreateNotificationInput): Notification { counter++; const n: Notification = { id: `notif-${counter}`, userId, ...input, status: "pending", createdAt: new Date() }; notifications.set(n.id, n); return n; }
export function sendNotification(id: string): Notification | null { const n = notifications.get(id); if (!n) return null; if (n.status !== "pending") throw new Error(`Cannot send notification in status: ${n.status}`); n.status = "sent"; n.sentAt = new Date(); return n; }
export function markAsRead(id: string): Notification | null { const n = notifications.get(id); if (!n) return null; n.status = "read"; n.readAt = new Date(); return n; }
export function getUserNotifications(userId: string, opts: { channel?: NotificationChannel; unreadOnly?: boolean } = {}): Notification[] { let r = Array.from(notifications.values()).filter(n => n.userId === userId); if (opts.channel) r = r.filter(n => n.channel === opts.channel); if (opts.unreadOnly) r = r.filter(n => n.status !== "read"); return r.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()); }
export function countUnread(userId: string): number { return Array.from(notifications.values()).filter(n => n.userId === userId && n.status !== "read").length; }
export function getNotification(id: string): Notification | undefined { return notifications.get(id); }
export function clearNotifications(): void { notifications.clear(); counter = 0; }
