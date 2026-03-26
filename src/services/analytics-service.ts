import { getAllProducts } from "./product-service";
import { EventEmitter } from "events";

/**
 * BUG #4 — Memory leak (Kata: Bug Hunt #4)
 *
 * This service registers event listeners on every call
 * to trackEvent() but never removes them.
 * Over time, this causes a memory leak.
 */

const emitter = new EventEmitter();
const eventLog: Array<{ event: string; data: unknown; timestamp: Date }> = [];

export function trackEvent(event: string, data: unknown): void {
  // BUG: adds a new listener every call, never removed
  emitter.on("flush", () => {
    eventLog.push({ event, data, timestamp: new Date() });
  });

  emitter.emit("flush");
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

/**
 * BUG #5 — Silent regression (Kata: Bug Hunt #5)
 *
 * This function used to compute discount based on total cart value.
 * A "refactor" changed the comparison from >= to > on the 100 threshold,
 * meaning carts of exactly 100 no longer get a discount.
 * No error is thrown — the function just returns a wrong (lower) discount.
 */
export function computeDiscount(cartTotal: number, userRole: string): number {
  let discount = 0;

  // Loyalty discount by role
  if (userRole === "admin") {
    discount += 0.15;
  } else if (userRole === "user") {
    discount += 0.05;
  }

  // Volume discount — BUG: should be >= 100, was changed to > 100
  if (cartTotal > 500) {
    discount += 0.10;
  } else if (cartTotal > 200) {
    discount += 0.07;
  } else if (cartTotal > 100) {
    // BUG: silent regression — was >= 100, now > 100
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
