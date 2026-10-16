export type ProductStatus = "draft" | "active" | "archived";

// One option pair for the bulk-create flow, e.g. { name: "Color", value: "Red" }.
// The backend resolves or auto-creates the matching option type/value by name
// — no need to create option types up front for this flow.
export interface CreateProductVariantOption {
  name: string;
  value: string;
}

// A single variant row inside a bulk product-create request. Distinct from
// CreateVariantRequest (below), which is for adding ONE variant to an
// already-existing product and identifies options by id, not name/value.
export interface CreateProductVariantInput {
  sku: string;
  barcode?: string;
  price: string;
  cost_price?: string;
  weight?: string;
  options: CreateProductVariantOption[];
  initial_quantity: number;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  sku: string;
  // Required when `variants` is omitted; optional when it's provided, since
  // price and stock then live on each variant instead.
  price?: string;
  initial_quantity?: number;
  // When present, the backend creates the product AND every listed variant
  // (plus any new option types/values they need) in a single transaction.
  variants?: CreateProductVariantInput[];
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  price: string;
  status: ProductStatus;
}

export interface ProductInventory {
  quantity_on_hand: number;
  quantity_reserved?: number;
  quantity_available: number;
  version?: number;
  updated_at?: string;
}

export interface ProductResponse {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: string;
  status: ProductStatus;
  inventory: ProductInventory;
  // Only populated in the response to a bulk create-with-variants call.
  // Plain GET /products and GET /products/{id} leave this empty — fetch
  // listVariants(productId) for those instead.
  variants?: VariantResponse[];
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  products: ProductResponse[];
  limit: number;
  offset: number;
}

export interface InventoryAdjustmentRequest {
  quantity_delta: number;
}

// ---------------------------------------------------------------------------
// Options (e.g. "Size" -> "M", "L", "XL"). Business-wide, shared across
// products; a variant is built by picking one value per relevant option type.
// ---------------------------------------------------------------------------

export interface OptionValueResponse {
  id: string;
  value: string;
}

export interface OptionTypeResponse {
  id: string;
  name: string;
  values: OptionValueResponse[];
}

export interface CreateOptionTypeRequest {
  name: string;
}

export interface UpdateOptionTypeRequest {
  name: string;
}

export interface CreateOptionValueRequest {
  value: string;
}

export interface UpdateOptionValueRequest {
  value: string;
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

export interface CreateVariantRequest {
  sku: string;
  barcode?: string;
  price: string;
  cost_price?: string;
  weight?: string;
  option_value_ids: string[];
  initial_quantity: number;
}

export interface UpdateVariantRequest {
  sku: string;
  barcode?: string;
  price: string;
  cost_price?: string;
  weight?: string;
  option_value_ids: string[];
}

export interface VariantOptionResponse {
  option_type_id: string;
  option_type_name: string;
  id: string;
  value: string;
}

export interface VariantResponse {
  id: string;
  sku: string;
  barcode?: string;
  price: string;
  cost_price: string;
  weight?: string;
  is_default: boolean;
  option_values: VariantOptionResponse[];
  inventory: ProductInventory;
  created_at: string;
  updated_at: string;
}