import { PaginatedResult } from "../types";

/**
 * BUG #1 — Off-by-one (Kata: Bug Hunt #1)
 *
 * This function has an off-by-one error in the pagination logic.
 * When requesting the last page, it may return one extra item
 * or skip the last item entirely.
 */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const safePage = Math.max(1, Math.min(page, totalPages));

  // BUG: off-by-one — should be (safePage - 1) * pageSize
  const startIndex = safePage * pageSize;
  const endIndex = startIndex + pageSize;

  const data = items.slice(startIndex, endIndex);

  return {
    data,
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export function sortBy<T>(items: T[], key: keyof T, order: "asc" | "desc" = "asc"): T[] {
  return [...items].sort((a, b) => {
    const valA = a[key];
    const valB = b[key];

    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
  });
}
