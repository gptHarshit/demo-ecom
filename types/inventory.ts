export type InventoryStockStatus = "in-stock" | "low-stock" | "out-of-stock";

export type InventoryQuantityFilter =
  | "all"
  | "out-of-stock"
  | "low-stock"
  | "in-stock";

export interface InventoryProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  isLive: boolean;
}

export interface InventoryFilters {
  stockStatus: InventoryStockStatus | "all";
  quantity: InventoryQuantityFilter;
}