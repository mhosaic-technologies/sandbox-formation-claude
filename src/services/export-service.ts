import { Product } from "../types";
import { getAllProducts, getProductsByCategory, searchProducts } from "./product-service";
import { getAllUsers, findUsersByRole } from "./user-service";
import { computeDiscount, generateSalesReport } from "./analytics-service";

/**
 * THE MONSTER FUNCTION (Kata: La Fonction Monstre — M5)
 *
 * This function does way too many things:
 * - Validates input
 * - Fetches data from multiple sources
 * - Applies business rules
 * - Formats output
 * - Handles errors
 * - Generates statistics
 *
 * The goal is to refactor it into smaller, focused functions
 * WITHOUT breaking any tests.
 */
export function generateReport(
  type: string,
  options: {
    format?: "csv" | "json" | "summary";
    category?: string;
    search?: string;
    includeStats?: boolean;
    includeUsers?: boolean;
    userRole?: string;
    applyDiscount?: boolean;
    sortBy?: "name" | "price" | "stock";
    sortOrder?: "asc" | "desc";
    limit?: number;
    minPrice?: number;
    maxPrice?: number;
    minStock?: number;
  } = {}
): string {
  // --- Input validation ---
  if (!type || typeof type !== "string") {
    throw new Error("Report type is required");
  }
  const validTypes = ["products", "inventory", "sales", "full"];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid report type: ${type}. Valid types: ${validTypes.join(", ")}`);
  }
  const format = options.format || "json";
  if (!["csv", "json", "summary"].includes(format)) {
    throw new Error(`Invalid format: ${format}`);
  }

  // --- Data fetching ---
  let products: Product[];
  if (options.search) {
    products = searchProducts(options.search);
  } else if (options.category) {
    products = getProductsByCategory(options.category);
  } else {
    products = getAllProducts();
  }

  // --- Filtering ---
  if (options.minPrice !== undefined) {
    products = products.filter((p) => p.price >= options.minPrice!);
  }
  if (options.maxPrice !== undefined) {
    products = products.filter((p) => p.price <= options.maxPrice!);
  }
  if (options.minStock !== undefined) {
    products = products.filter((p) => p.stock >= options.minStock!);
  }

  // --- Sorting ---
  const sortKey = options.sortBy || "name";
  const sortOrder = options.sortOrder || "asc";
  products.sort((a, b) => {
    let valA: string | number;
    let valB: string | number;
    if (sortKey === "name") {
      valA = a.name.toLowerCase();
      valB = b.name.toLowerCase();
    } else if (sortKey === "price") {
      valA = a.price;
      valB = b.price;
    } else {
      valA = a.stock;
      valB = b.stock;
    }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // --- Limit ---
  if (options.limit && options.limit > 0) {
    products = products.slice(0, options.limit);
  }

  // --- Discount calculation ---
  let discountRate = 0;
  if (options.applyDiscount && options.userRole) {
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);
    discountRate = computeDiscount(totalValue, options.userRole);
  }

  // --- Format: CSV ---
  if (format === "csv") {
    const headers = ["id", "name", "price", "stock", "category"];
    if (options.applyDiscount) {
      headers.push("discountedPrice");
    }
    const rows = products.map((p) => {
      const base = [p.id, `"${p.name}"`, p.price.toFixed(2), p.stock.toString(), p.category];
      if (options.applyDiscount) {
        const discounted = p.price * (1 - discountRate);
        base.push(discounted.toFixed(2));
      }
      return base.join(",");
    });
    let csv = headers.join(",") + "\n" + rows.join("\n");

    if (options.includeStats) {
      const report = generateSalesReport();
      csv += "\n\n# Statistics";
      csv += `\nTotal Products: ${report.totalProducts}`;
      csv += `\nTotal Stock Value: ${report.totalStockValue.toFixed(2)}`;
      Object.entries(report.categorySummary).forEach(([cat, data]) => {
        csv += `\n${cat}: ${data.count} products, ${data.value.toFixed(2)} value`;
      });
    }

    if (options.includeUsers) {
      const users = options.userRole
        ? findUsersByRole(options.userRole)
        : getAllUsers();
      csv += "\n\n# Users";
      csv += "\nid,name,email,role";
      users.forEach((u) => {
        csv += `\n${u.id},"${u.name}",${u.email},${u.role}`;
      });
    }

    return csv;
  }

  // --- Format: Summary ---
  if (format === "summary") {
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const avgPrice = products.length > 0
      ? products.reduce((sum, p) => sum + p.price, 0) / products.length
      : 0;
    const categories = [...new Set(products.map((p) => p.category))];

    let summary = `Report: ${type.toUpperCase()}\n`;
    summary += `Products: ${products.length}\n`;
    summary += `Total stock value: ${totalValue.toFixed(2)}\n`;
    summary += `Average price: ${avgPrice.toFixed(2)}\n`;
    summary += `Categories: ${categories.join(", ")}\n`;

    if (discountRate > 0) {
      summary += `Discount applied: ${(discountRate * 100).toFixed(1)}%\n`;
      const discountedTotal = totalValue * (1 - discountRate);
      summary += `Discounted total: ${discountedTotal.toFixed(2)}\n`;
    }

    if (options.includeStats) {
      const report = generateSalesReport();
      summary += `\n--- Full Statistics ---\n`;
      summary += `Total catalog products: ${report.totalProducts}\n`;
      summary += `Total catalog value: ${report.totalStockValue.toFixed(2)}\n`;
    }

    return summary;
  }

  // --- Format: JSON ---
  const result: Record<string, unknown> = {
    type,
    generatedAt: new Date().toISOString(),
    count: products.length,
    products: products.map((p) => {
      const item: Record<string, unknown> = {
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        category: p.category,
        tags: p.tags,
      };
      if (options.applyDiscount) {
        item.discountRate = discountRate;
        item.discountedPrice = +(p.price * (1 - discountRate)).toFixed(2);
      }
      return item;
    }),
  };

  if (options.includeStats) {
    result.statistics = generateSalesReport();
  }

  if (options.includeUsers) {
    const users = options.userRole
      ? findUsersByRole(options.userRole)
      : getAllUsers();
    result.users = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
    }));
  }

  return JSON.stringify(result, null, 2);
}
