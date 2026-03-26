import { User } from "../types";

const users: Map<string, User> = new Map();

// Seed data
const seedUsers: User[] = [
  { id: "u1", name: "Alice Martin", email: "alice@example.com", role: "admin", createdAt: new Date("2024-01-15") },
  { id: "u2", name: "Bob Dupont", email: "bob@example.com", role: "user", createdAt: new Date("2024-03-20") },
  { id: "u3", name: "Charlie Durand", email: "charlie@example.com", role: "user", createdAt: new Date("2024-06-10") },
  { id: "u4", name: "Diana Petit", email: "diana@example.com", role: "viewer", createdAt: new Date("2024-08-05") },
  { id: "u5", name: "Eve Bernard", email: "eve@example.com", role: "user", createdAt: new Date("2024-09-12") },
];

export function initUsers(): void {
  users.clear();
  seedUsers.forEach((u) => users.set(u.id, { ...u }));
}

export function getAllUsers(): User[] {
  return Array.from(users.values());
}

/**
 * BUG #2 — Null pointer (Kata: Bug Hunt #2)
 *
 * This function does not check if the user exists before
 * accessing properties, causing a crash on unknown IDs.
 */
export function getUserProfile(userId: string): {
  name: string;
  email: string;
  role: string;
  daysSinceCreation: number;
} {
  const user = users.get(userId);

  // BUG: no null check — crashes when userId doesn't exist
  const now = new Date();
  const diffMs = now.getTime() - user!.createdAt.getTime();
  const daysSinceCreation = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return {
    name: user!.name,
    email: user!.email,
    role: user!.role,
    daysSinceCreation,
  };
}

export function findUsersByRole(role: string): User[] {
  return getAllUsers().filter((u) => u.role === role);
}

export function updateUser(userId: string, updates: Partial<User>): User | null {
  const user = users.get(userId);
  if (!user) return null;

  const updated = { ...user, ...updates };
  users.set(userId, updated);
  return updated;
}

export function deleteUser(userId: string): boolean {
  return users.delete(userId);
}

initUsers();
