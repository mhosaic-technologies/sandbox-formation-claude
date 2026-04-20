import { getAllProducts } from "./product-service";
import { EventEmitter } from "events";

const emitter = new EventEmitter();
const eventLog: Array<{ event: string; data: unknown; timestamp: Date }> = [];

emitter.on("flush", (event: string, data: unknown) => {
  eventLog.push({ event, data, timestamp: new Date() });
});

export function trackEvent(event: string, data: unknown): void {
  emitter.emit("flush", event, data);
}

export function getEventLog(): typeof eventLog {
  return [...eventLog];
}

export function getListenerCount(): number {
  return emitter.listenerCount("flush");
}

export function clearEventLog(): void {
  eventLog.length = 0;
}

export function computeDiscount(cartTotal: number, userRole: string): number {
  let discount = 0;

  // Loyalty discount by role
  if (userRole === "admin") {
    discount += 0.15;
  } else if (userRole === "user") {
    discount += 0.05;
  }

  // Volume discount
  if (cartTotal >= 500) {
    discount += 0.10;
  } else if (cartTotal >= 200) {
    discount += 0.07;
  } else if (cartTotal >= 100) {
    discount += 0.03;
  }

  return Math.min(discount, 0.25);
}

export function generateSalesReport(): {
  totalProducts: number;
  totalStockValue: number;
  categorySummary: Record<string, { count: number; value: number }>;
} {
  const products = getAllProducts();
  const categorySummary: Record<string, { count: number; value: number }> = {};

  let totalStockValue = 0;

  for (const product of products) {
    const value = product.price * product.stock;
    totalStockValue += value;

    if (!categorySummary[product.category]) {
      categorySummary[product.category] = { count: 0, value: 0 };
    }
    categorySummary[product.category].count += 1;
    categorySummary[product.category].value += value;
  }

  return {
    totalProducts: products.length,
    totalStockValue,
    categorySummary,
  };
}
