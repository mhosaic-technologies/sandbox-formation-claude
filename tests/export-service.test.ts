import { describe, it, expect, beforeEach } from "vitest";
import { generateReport } from "../src/services/export-service";
import { initProducts } from "../src/services/product-service";
import { initUsers } from "../src/services/user-service";

beforeEach(() => {
  initProducts();
  initUsers();
});

describe("generateReport — validation", () => {
  it("should throw on empty type", () => {
    expect(() => generateReport("")).toThrow("Report type is required");
  });

  it("should throw on invalid type", () => {
    expect(() => generateReport("invalid")).toThrow("Invalid report type");
  });

  it("should throw on invalid format", () => {
    expect(() =>
      generateReport("products", { format: "xml" as "csv" })
    ).toThrow("Invalid format");
  });
});

describe("generateReport — JSON format", () => {
  it("should return valid JSON with all products", () => {
    const output = generateReport("products");
    const parsed = JSON.parse(output);
    expect(parsed.type).toBe("products");
    expect(parsed.count).toBe(8);
    expect(parsed.products).toHaveLength(8);
  });

  it("should filter by category", () => {
    const output = generateReport("products", { category: "peripheriques" });
    const parsed = JSON.parse(output);
    expect(parsed.count).toBe(3);
  });

  it("should filter by search query", () => {
    const output = generateReport("products", { search: "clavier" });
    const parsed = JSON.parse(output);
    expect(parsed.count).toBeGreaterThanOrEqual(1);
  });

  it("should filter by price range", () => {
    const output = generateReport("products", { minPrice: 100, maxPrice: 200 });
    const parsed = JSON.parse(output);
    parsed.products.forEach((p: { price: number }) => {
      expect(p.price).toBeGreaterThanOrEqual(100);
      expect(p.price).toBeLessThanOrEqual(200);
    });
  });

  it("should sort by price ascending", () => {
    const output = generateReport("products", { sortBy: "price", sortOrder: "asc" });
    const parsed = JSON.parse(output);
    for (let i = 1; i < parsed.products.length; i++) {
      expect(parsed.products[i].price).toBeGreaterThanOrEqual(parsed.products[i - 1].price);
    }
  });

  it("should sort by price descending", () => {
    const output = generateReport("products", { sortBy: "price", sortOrder: "desc" });
    const parsed = JSON.parse(output);
    for (let i = 1; i < parsed.products.length; i++) {
      expect(parsed.products[i].price).toBeLessThanOrEqual(parsed.products[i - 1].price);
    }
  });

  it("should limit results", () => {
    const output = generateReport("products", { limit: 3 });
    const parsed = JSON.parse(output);
    expect(parsed.count).toBe(3);
    expect(parsed.products).toHaveLength(3);
  });

  it("should include statistics when requested", () => {
    const output = generateReport("products", { includeStats: true });
    const parsed = JSON.parse(output);
    expect(parsed.statistics).toBeDefined();
    expect(parsed.statistics.totalProducts).toBe(8);
  });

  it("should include users when requested", () => {
    const output = generateReport("products", { includeUsers: true });
    const parsed = JSON.parse(output);
    expect(parsed.users).toBeDefined();
    expect(parsed.users.length).toBe(5);
  });

  it("should apply discount when requested", () => {
    const output = generateReport("products", {
      applyDiscount: true,
      userRole: "admin",
    });
    const parsed = JSON.parse(output);
    parsed.products.forEach((p: { discountedPrice: number; price: number }) => {
      expect(p.discountedPrice).toBeLessThan(p.price);
    });
  });
});

describe("generateReport — CSV format", () => {
  it("should return valid CSV", () => {
    const output = generateReport("products", { format: "csv" });
    const lines = output.split("\n");
    expect(lines[0]).toBe("id,name,price,stock,category");
    expect(lines.length).toBeGreaterThan(1);
  });

  it("should include discount column when applied", () => {
    const output = generateReport("products", {
      format: "csv",
      applyDiscount: true,
      userRole: "user",
    });
    const header = output.split("\n")[0];
    expect(header).toContain("discountedPrice");
  });

  it("should include stats section when requested", () => {
    const output = generateReport("products", {
      format: "csv",
      includeStats: true,
    });
    expect(output).toContain("# Statistics");
    expect(output).toContain("Total Products:");
  });

  it("should include users section when requested", () => {
    const output = generateReport("products", {
      format: "csv",
      includeUsers: true,
    });
    expect(output).toContain("# Users");
    expect(output).toContain("alice@example.com");
  });
});

describe("generateReport — Summary format", () => {
  it("should return readable summary", () => {
    const output = generateReport("products", { format: "summary" });
    expect(output).toContain("Report: PRODUCTS");
    expect(output).toContain("Products: 8");
    expect(output).toContain("Average price:");
  });

  it("should include discount info when applied", () => {
    const output = generateReport("products", {
      format: "summary",
      applyDiscount: true,
      userRole: "admin",
    });
    expect(output).toContain("Discount applied:");
    expect(output).toContain("Discounted total:");
  });

  it("should include stats when requested", () => {
    const output = generateReport("products", {
      format: "summary",
      includeStats: true,
    });
    expect(output).toContain("Full Statistics");
  });
});

describe("generateReport — all types", () => {
  it("should handle 'inventory' type", () => {
    const output = generateReport("inventory");
    expect(JSON.parse(output).type).toBe("inventory");
  });

  it("should handle 'sales' type", () => {
    const output = generateReport("sales");
    expect(JSON.parse(output).type).toBe("sales");
  });

  it("should handle 'full' type", () => {
    const output = generateReport("full", { includeStats: true, includeUsers: true });
    const parsed = JSON.parse(output);
    expect(parsed.type).toBe("full");
    expect(parsed.statistics).toBeDefined();
    expect(parsed.users).toBeDefined();
  });
});
