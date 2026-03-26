import { Order, OrderItem } from "../types";

const orders: Map<string, Order> = new Map();
let orderCounter = 0;

/**
 * BUG #3 — Race condition (Kata: Bug Hunt #3)
 *
 * This function simulates async order creation. When called
 * concurrently, the orderCounter increment is not atomic,
 * leading to duplicate IDs.
 */
export async function createOrder(
  userId: string,
  items: OrderItem[]
): Promise<Order> {
  // BUG: non-atomic read-then-write on shared counter
  const currentCount = orderCounter;

  // Simulate async work (DB call, payment check, etc.)
  await new Promise((resolve) => setTimeout(resolve, 10));

  orderCounter = currentCount + 1;
  const id = `order-${orderCounter}`;

  const totalAmount = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const order: Order = {
    id,
    userId,
    items,
    status: "pending",
    totalAmount,
    createdAt: new Date(),
  };

  orders.set(id, order);
  return order;
}

export function getOrder(orderId: string): Order | undefined {
  return orders.get(orderId);
}

export function getUserOrders(userId: string): Order[] {
  return Array.from(orders.values()).filter((o) => o.userId === userId);
}

export function updateOrderStatus(
  orderId: string,
  status: Order["status"]
): Order | null {
  const order = orders.get(orderId);
  if (!order) return null;

  order.status = status;
  orders.set(orderId, order);
  return order;
}

export function clearOrders(): void {
  orders.clear();
  orderCounter = 0;
}
