import { describe, it, expect, beforeEach } from "vitest";
import {
  initUsers,
  getAllUsers,
  getUserProfile,
  findUsersByRole,
  updateUser,
  deleteUser,
} from "../src/services/user-service";

beforeEach(() => {
  initUsers();
});

describe("getAllUsers", () => {
  it("should return all seeded users", () => {
    const users = getAllUsers();
    expect(users).toHaveLength(5);
  });
});

describe("getUserProfile", () => {
  it("should return profile for existing user", () => {
    const profile = getUserProfile("u1");
    expect(profile.name).toBe("Alice Martin");
    expect(profile.email).toBe("alice@example.com");
    expect(profile.role).toBe("admin");
    expect(profile.daysSinceCreation).toBeGreaterThan(0);
  });

  it("should throw for non-existent user", () => {
    expect(() => getUserProfile("nonexistent")).toThrow("User not found");
  });
});

describe("findUsersByRole", () => {
  it("should find users by role", () => {
    const admins = findUsersByRole("admin");
    expect(admins).toHaveLength(1);
    expect(admins[0].name).toBe("Alice Martin");
  });

  it("should return empty array for non-existent role", () => {
    const result = findUsersByRole("superadmin");
    expect(result).toHaveLength(0);
  });
});

describe("updateUser", () => {
  it("should update user fields", () => {
    const updated = updateUser("u2", { name: "Robert Dupont" });
    expect(updated?.name).toBe("Robert Dupont");
    expect(updated?.email).toBe("bob@example.com");
  });

  it("should return null for non-existent user", () => {
    const result = updateUser("nonexistent", { name: "Test" });
    expect(result).toBeNull();
  });
});

describe("deleteUser", () => {
  it("should delete existing user", () => {
    expect(deleteUser("u3")).toBe(true);
    expect(getAllUsers()).toHaveLength(4);
  });

  it("should return false for non-existent user", () => {
    expect(deleteUser("nonexistent")).toBe(false);
  });
});
