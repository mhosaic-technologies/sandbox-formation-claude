import { describe, it, expect, beforeEach } from "vitest";
import {
  createOrder,
  getOrder,
  getUserOrders,
  updateOrderStatus,
  clearOrders,
} from "../src/services/order-service";
import { OrderItem } from "../src/types";

const sampleItems: OrderItem[] = [
  { productId: "p1", quantity: 2, unitPrice: 129.99 },
  { productId: "p4", quantity: 1, unitPrice: 59.99 },
];

beforeEach(() => {
  clearOrders();
});

describe("createOrder", () => {
  it("should create an order with correct total", async () => {
    const order = await createOrder("u1", sampleItems);
    expect(order.userId).toBe("u1");
    expect(order.status).toBe("pending");
    expect(order.totalAmount).toBeCloseTo(319.97, 2);
    expect(order.items).toHaveLength(2);
  });

  it("should generate unique IDs for concurrent orders", async () => {
    const orders = await Promise.all([
      createOrder("u1", sampleItems),
      createOrder("u2", sampleItems),
      createOrder("u3", sampleItems),
    ]);

    const ids = orders.map((o) => o.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(3);
  });
});

describe("getOrder", () => {
  it("should retrieve created order", async () => {
    const created = await createOrder("u1", sampleItems);
    const found = getOrder(created.id);
    expect(found).toBeDefined();
    expect(found?.userId).toBe("u1");
  });

  it("should return undefined for non-existent order", () => {
    expect(getOrder("nonexistent")).toBeUndefined();
  });
});

describe("getUserOrders", () => {
  it("should return orders for a specific user", async () => {
    await createOrder("u1", sampleItems);
    await createOrder("u1", sampleItems);
    await createOrder("u2", sampleItems);

    const u1Orders = getUserOrders("u1");
    expect(u1Orders).toHaveLength(2);
  });
});

describe("updateOrderStatus", () => {
  it("should update order status", async () => {
    const order = await createOrder("u1", sampleItems);
    const updated = updateOrderStatus(order.id, "confirmed");
    expect(updated?.status).toBe("confirmed");
  });

  it("should return null for non-existent order", () => {
    expect(updateOrderStatus("nonexistent", "confirmed")).toBeNull();
  });
});
