import { Product } from "../types";
import { getAllProducts, getProductsByCategory, searchProducts } from "./product-service";
import { getAllUsers, findUsersByRole } from "./user-service";
import { computeDiscount, generateSalesReport } from "./analytics-service";

interface ReportOptions {
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
}

function validateReportInput(type: string, format: string): void {
  if (!type || typeof type !== "string") {
    throw new Error("Report type is required");
  }
  const validTypes = ["products", "inventory", "sales", "full"];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid report type: ${type}. Valid types: ${validTypes.join(", ")}`);
  }
  if (!["csv", "json", "summary"].includes(format)) {
    throw new Error(`Invalid format: ${format}`);
  }
}

function fetchProducts(options: ReportOptions): Product[] {
  if (options.search) return searchProducts(options.search);
  if (options.category) return getProductsByCategory(options.category);
  return getAllProducts();
}

function filterProducts(products: Product[], options: Pick<ReportOptions, "minPrice" | "maxPrice" | "minStock">): Product[] {
  let result = products;
  if (options.minPrice !== undefined) result = result.filter((p) => p.price >= options.minPrice!);
  if (options.maxPrice !== undefined) result = result.filter((p) => p.price <= options.maxPrice!);
  if (options.minStock !== undefined) result = result.filter((p) => p.stock >= options.minStock!);
  return result;
}

function sortProducts(products: Product[], sortBy: "name" | "price" | "stock" = "name", sortOrder: "asc" | "desc" = "asc"): Product[] {
  return [...products].sort((a, b) => {
    let valA: string | number, valB: string | number;
    if (sortBy === "name") { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); }
    else if (sortBy === "price") { valA = a.price; valB = b.price; }
    else { valA = a.stock; valB = b.stock; }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
}

function getDiscountRate(products: Product[], options: ReportOptions): number {
  if (!options.applyDiscount || !options.userRole) return 0;
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);
  return computeDiscount(totalValue, options.userRole);
}

function formatCsv(products: Product[], discountRate: number, options: ReportOptions): string {
  const headers = ["id", "name", "price", "stock", "category"];
  if (options.applyDiscount) headers.push("discountedPrice");
  const rows = products.map((p) => {
    const base = [p.id, `"${p.name}"`, p.price.toFixed(2), p.stock.toString(), p.category];
    if (options.applyDiscount) base.push((p.price * (1 - discountRate)).toFixed(2));
    return base.join(",");
  });
  let csv = headers.join(",") + "\n" + rows.join("\n");
  if (options.includeStats) {
    const report = generateSalesReport();
    csv += "\n\n# Statistics";
    csv += `\nTotal Products: ${report.totalProducts}`;
    csv += `\nTotal Stock Value: ${report.totalStockValue.toFixed(2)}`;
    Object.entries(report.categorySummary).forEach(([cat, data]) => { csv += `\n${cat}: ${data.count} products, ${data.value.toFixed(2)} value`; });
  }
  if (options.includeUsers) {
    const users = options.userRole ? findUsersByRole(options.userRole) : getAllUsers();
    csv += "\n\n# Users\nid,name,email,role";
    users.forEach((u) => { csv += `\n${u.id},"${u.name}",${u.email},${u.role}`; });
  }
  return csv;
}

function formatSummary(type: string, products: Product[], discountRate: number, options: ReportOptions): string {
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const avgPrice = products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0;
  const categories = [...new Set(products.map((p) => p.category))];
  let summary = `Report: ${type.toUpperCase()}\nProducts: ${products.length}\nTotal stock value: ${totalValue.toFixed(2)}\nAverage price: ${avgPrice.toFixed(2)}\nCategories: ${categories.join(", ")}\n`;
  if (discountRate > 0) { summary += `Discount applied: ${(discountRate * 100).toFixed(1)}%\nDiscounted total: ${(totalValue * (1 - discountRate)).toFixed(2)}\n`; }
  if (options.includeStats) { const report = generateSalesReport(); summary += `\n--- Full Statistics ---\nTotal catalog products: ${report.totalProducts}\nTotal catalog value: ${report.totalStockValue.toFixed(2)}\n`; }
  return summary;
}

function formatJson(type: string, products: Product[], discountRate: number, options: ReportOptions): string {
  const result: Record<string, unknown> = {
    type, generatedAt: new Date().toISOString(), count: products.length,
    products: products.map((p) => {
      const item: Record<string, unknown> = { id: p.id, name: p.name, price: p.price, stock: p.stock, category: p.category, tags: p.tags };
      if (options.applyDiscount) { item.discountRate = discountRate; item.discountedPrice = +(p.price * (1 - discountRate)).toFixed(2); }
      return item;
    }),
  };
  if (options.includeStats) result.statistics = generateSalesReport();
  if (options.includeUsers) {
    const users = options.userRole ? findUsersByRole(options.userRole) : getAllUsers();
    result.users = users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
  }
  return JSON.stringify(result, null, 2);
}

export function generateReport(type: string, options: ReportOptions = {}): string {
  const format = options.format || "json";
  validateReportInput(type, format);
  let products = fetchProducts(options);
  products = filterProducts(products, options);
  products = sortProducts(products, options.sortBy, options.sortOrder);
  if (options.limit && options.limit > 0) products = products.slice(0, options.limit);
  const discountRate = getDiscountRate(products, options);
  switch (format) {
    case "csv": return formatCsv(products, discountRate, options);
    case "summary": return formatSummary(type, products, discountRate, options);
    default: return formatJson(type, products, discountRate, options);
  }
}
