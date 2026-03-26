import { describe, it, expect, beforeEach } from "vitest";
import {
  trackEvent,
  getEventLog,
  getListenerCount,
  clearEventLog,
  computeDiscount,
  generateSalesReport,
} from "../src/services/analytics-service";
import { initProducts } from "../src/services/product-service";

beforeEach(() => {
  initProducts();
  clearEventLog();
});

describe("trackEvent", () => {
  it("should record an event", () => {
    trackEvent("page_view", { page: "/products" });
    const log = getEventLog();
    expect(log.length).toBeGreaterThan(0);
    expect(log[0].event).toBe("page_view");
  });

  it("should not leak listeners over multiple calls", () => {
    const initialCount = getListenerCount();

    for (let i = 0; i < 50; i++) {
      trackEvent("click", { button: i });
    }

    const finalCount = getListenerCount();
    // If properly implemented, listener count should stay constant
    expect(finalCount).toBeLessThanOrEqual(initialCount + 1);
  });
});

describe("computeDiscount", () => {
  it("should give 15% discount for admin role", () => {
    expect(computeDiscount(50, "admin")).toBeCloseTo(0.15, 2);
  });

  it("should give 5% discount for user role", () => {
    expect(computeDiscount(50, "user")).toBeCloseTo(0.05, 2);
  });

  it("should give 0% discount for viewer role", () => {
    expect(computeDiscount(50, "viewer")).toBeCloseTo(0, 2);
  });

  it("should add volume discount for cart >= 100", () => {
    // Cart of exactly 100 should get 3% volume + 5% user = 8%
    expect(computeDiscount(100, "user")).toBeCloseTo(0.08, 2);
  });

  it("should add volume discount for cart >= 200", () => {
    expect(computeDiscount(250, "user")).toBeCloseTo(0.12, 2);
  });

  it("should add volume discount for cart >= 500", () => {
    expect(computeDiscount(600, "user")).toBeCloseTo(0.15, 2);
  });

  it("should cap discount at 25%", () => {
    expect(computeDiscount(600, "admin")).toBeCloseTo(0.25, 2);
  });
});

describe("generateSalesReport", () => {
  it("should return correct product count", () => {
    const report = generateSalesReport();
    expect(report.totalProducts).toBe(8);
  });

  it("should compute total stock value", () => {
    const report = generateSalesReport();
    expect(report.totalStockValue).toBeGreaterThan(0);
  });

  it("should include category breakdown", () => {
    const report = generateSalesReport();
    expect(Object.keys(report.categorySummary)).toContain("peripheriques");
    expect(report.categorySummary["peripheriques"].count).toBe(3);
  });
});
