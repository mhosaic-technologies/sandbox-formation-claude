import { Product } from "../types";

const products: Map<string, Product> = new Map();

const seedProducts: Product[] = [
  { id: "p1", name: "Clavier Mecanique", description: "Cherry MX Brown", price: 129.99, stock: 45, category: "peripheriques", tags: ["clavier", "mecanique", "gaming"] },
  { id: "p2", name: "Souris Ergonomique", description: "Verticale, sans fil", price: 79.99, stock: 120, category: "peripheriques", tags: ["souris", "ergonomie"] },
  { id: "p3", name: "Ecran 4K 27\"", description: "IPS, 60Hz, USB-C", price: 449.99, stock: 30, category: "ecrans", tags: ["ecran", "4k", "usb-c"] },
  { id: "p4", name: "Hub USB-C", description: "7 ports, HDMI, Ethernet", price: 59.99, stock: 200, category: "accessoires", tags: ["hub", "usb-c"] },
  { id: "p5", name: "Casque Audio", description: "ANC, Bluetooth 5.3", price: 199.99, stock: 75, category: "audio", tags: ["casque", "anc", "bluetooth"] },
  { id: "p6", name: "Webcam 1080p", description: "Autofocus, micro integre", price: 89.99, stock: 60, category: "peripheriques", tags: ["webcam", "streaming"] },
  { id: "p7", name: "Support Ecran", description: "Bras articule, VESA", price: 39.99, stock: 150, category: "accessoires", tags: ["support", "ergonomie"] },
  { id: "p8", name: "SSD NVMe 1To", description: "PCIe Gen4, 7000Mo/s", price: 109.99, stock: 90, category: "stockage", tags: ["ssd", "nvme", "stockage"] },
];

export function initProducts(): void {
  products.clear();
  seedProducts.forEach((p) => products.set(p.id, { ...p }));
}

export function getAllProducts(): Product[] {
  return Array.from(products.values());
}

export function getProductById(id: string): Product | undefined {
  return products.get(id);
}

export function searchProducts(query: string): Product[] {
  const lower = query.toLowerCase();
  return getAllProducts().filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      p.tags.some((t) => t.includes(lower))
  );
}

export function getProductsByCategory(category: string): Product[] {
  return getAllProducts().filter((p) => p.category === category);
}

export function updateStock(productId: string, quantityChange: number): Product | null {
  const product = products.get(productId);
  if (!product) return null;

  product.stock += quantityChange;
  return product;
}

initProducts();
