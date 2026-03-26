import { describe, it, expect } from "vitest";
import { paginate, sortBy } from "../src/utils/pagination";

const items = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
}));

describe("paginate", () => {
  it("should return the first page correctly", () => {
    const result = paginate(items, 1, 10);
    expect(result.data).toHaveLength(10);
    expect(result.data[0].id).toBe(1);
    expect(result.data[9].id).toBe(10);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(3);
    expect(result.total).toBe(25);
  });

  it("should return the second page correctly", () => {
    const result = paginate(items, 2, 10);
    expect(result.data).toHaveLength(10);
    expect(result.data[0].id).toBe(11);
    expect(result.data[9].id).toBe(20);
  });

  it("should return the last page with remaining items", () => {
    const result = paginate(items, 3, 10);
    expect(result.data).toHaveLength(5);
    expect(result.data[0].id).toBe(21);
    expect(result.data[4].id).toBe(25);
  });

  it("should clamp page number to valid range", () => {
    const result = paginate(items, 99, 10);
    expect(result.page).toBe(3);
    expect(result.data.length).toBeGreaterThan(0);
  });

  it("should handle page size larger than total items", () => {
    const result = paginate(items, 1, 100);
    expect(result.data).toHaveLength(25);
    expect(result.totalPages).toBe(1);
  });

  it("should return empty array for empty input", () => {
    const result = paginate([], 1, 10);
    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

describe("sortBy", () => {
  const data = [
    { name: "Charlie", age: 30 },
    { name: "Alice", age: 25 },
    { name: "Bob", age: 35 },
  ];

  it("should sort ascending by default", () => {
    const sorted = sortBy(data, "name");
    expect(sorted[0].name).toBe("Alice");
    expect(sorted[2].name).toBe("Charlie");
  });

  it("should sort descending", () => {
    const sorted = sortBy(data, "age", "desc");
    expect(sorted[0].age).toBe(35);
    expect(sorted[2].age).toBe(25);
  });

  it("should not mutate the original array", () => {
    const original = [...data];
    sortBy(data, "name");
    expect(data).toEqual(original);
  });
});
