// ---------------------------------------------------------------------------
// IN-BROWSER DEMO BACKEND
//
// This replaces the real Go "Commerce Core" API. It implements the same
// endpoints, request/response shapes and error codes that the frontend
// already expects, but keeps everything in the browser's localStorage and is
// seeded with demo data (see ./seed.ts). Nothing is sent over the network.
//
// lib/api/client.ts calls `mockFetch()` instead of `fetch()`, so every page
// and component works exactly as before without any changes.
// ---------------------------------------------------------------------------

import type { ApiErrorResponse } from "@/types/api";
import {
  DEMO_ACCOUNT,
  SEED_OPTION_TYPES,
  SEED_PRODUCTS,
  type SeedProduct,
} from "./seed";

const STORAGE_KEY = "mlk_demo_db_v1";
const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/* ============================================================
   STORED SHAPES
============================================================ */

interface DbUser {
  id: string;
  name: string;
  email: string;
  password: string;
  business_id: string;
}

interface DbBusiness {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  warehouse: { id: string; name: string; type: string };
  channel: { id: string; name: string; type: string };
}

interface DbOptionValue {
  id: string;
  value: string;
}

interface DbOptionType {
  id: string;
  name: string;
  values: DbOptionValue[];
}

interface DbVariant {
  id: string;
  sku: string;
  barcode?: string;
  price: string;
  cost_price: string;
  weight?: string;
  is_default: boolean;
  option_value_ids: string[];
  on_hand: number;
  reserved: number;
  version: number;
  inventory_updated_at: string;
  created_at: string;
  updated_at: string;
}

interface DbProduct {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: string;
  status: "draft" | "active" | "archived";
  variants: DbVariant[];
  created_at: string;
  updated_at: string;
}

interface DbCatalog {
  products: DbProduct[];
  optionTypes: DbOptionType[];
}

interface DbToken {
  user_id: string;
  expires_at: number;
}

interface Db {
  users: DbUser[];
  businesses: DbBusiness[];
  catalogs: Record<string, DbCatalog>;
  access_tokens: Record<string, DbToken>;
  refresh_tokens: Record<string, DbToken>;
}

/* ============================================================
   HELPERS
============================================================ */

class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function token(): string {
  return `demo.${uid().replace(/-/g, "")}${uid().replace(/-/g, "")}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function daysAgoIso(days: number, hourOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(10 + (hourOffset % 9), (hourOffset * 17) % 60, 0, 0);
  return d.toISOString();
}

function money(value: number | string): string {
  return Number(value).toFixed(2);
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "store"
  );
}

const PRICE_RE = /^\d+(\.\d{1,2})?$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

/* ============================================================
   PERSISTENCE
============================================================ */

let memoryDb: Db | null = null;

function emptyDb(): Db {
  return {
    users: [],
    businesses: [],
    catalogs: {},
    access_tokens: {},
    refresh_tokens: {},
  };
}

function loadDb(): Db {
  if (memoryDb) return memoryDb;

  let db: Db | null = null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) db = JSON.parse(raw) as Db;
  } catch {
    db = null;
  }

  if (!db || !Array.isArray(db.users)) db = emptyDb();

  // Always make sure the ready-made demo workspace exists.
  if (!db.users.some((u) => u.email === DEMO_ACCOUNT.email)) {
    createWorkspace(db, {
      ownerName: DEMO_ACCOUNT.name,
      email: DEMO_ACCOUNT.email,
      password: DEMO_ACCOUNT.password,
      businessName: DEMO_ACCOUNT.businessName,
      plan: "pro",
    });
  }

  memoryDb = db;
  saveDb();
  return db;
}

function saveDb(): void {
  if (!memoryDb) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryDb));
  } catch {
    // Storage full or unavailable: keep working in memory for this tab.
  }
}

// Keep tabs in sync: another tab changed the demo data, so re-read it.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) memoryDb = null;
  });
}

/** Wipes all demo data and restores the original seed. */
export function resetDemoData(): void {
  memoryDb = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/* ============================================================
   SEEDING
============================================================ */

function buildCatalog(): DbCatalog {
  const optionTypes: DbOptionType[] = Object.entries(SEED_OPTION_TYPES).map(
    ([name, values]) => ({
      id: uid(),
      name,
      values: values.map((value) => ({ id: uid(), value })),
    }),
  );

  const valueId = (typeName: string, value: string): string => {
    const type = optionTypes.find((t) => t.name === typeName);
    const val = type?.values.find((v) => v.value === value);
    if (!val) throw new Error(`Seed option missing: ${typeName}=${value}`);
    return val.id;
  };

  const products = SEED_PRODUCTS.map((seed: SeedProduct, index) => {
    const created = daysAgoIso(seed.daysAgo, index);
    const updated = daysAgoIso(Math.max(0, seed.daysAgo - 3 - (index % 5)), index + 3);

    let variants: DbVariant[];

    if (seed.variants && seed.variants.length > 0) {
      variants = seed.variants.map((v, vi) => {
        const suffix = Object.values(v.options)
          .map((o) => o.replace(/\s+/g, "").slice(0, 3).toUpperCase())
          .join("-");
        return {
          id: uid(),
          sku: `${seed.sku}-${suffix}`,
          barcode: `890${String(1000000000 + index * 100 + vi).slice(0, 10)}`,
          price: money(v.price ?? seed.price),
          cost_price: money(v.cost ?? seed.cost ?? 0),
          weight: v.weight ?? seed.weight,
          is_default: false,
          option_value_ids: Object.entries(v.options).map(([t, val]) =>
            valueId(t, val),
          ),
          on_hand: v.qty,
          reserved: Math.min(v.reserved ?? 0, v.qty),
          version: 1 + ((index + vi) % 4),
          inventory_updated_at: updated,
          created_at: created,
          updated_at: updated,
        };
      });
    } else {
      variants = [
        {
          id: uid(),
          sku: seed.sku,
          barcode: `890${String(2000000000 + index).slice(0, 10)}`,
          price: money(seed.price),
          cost_price: money(seed.cost ?? 0),
          weight: seed.weight,
          is_default: true,
          option_value_ids: [],
          on_hand: seed.qty ?? 0,
          reserved: Math.min(seed.reserved ?? 0, seed.qty ?? 0),
          version: 1 + (index % 4),
          inventory_updated_at: updated,
          created_at: created,
          updated_at: updated,
        },
      ];
    }

    const product: DbProduct = {
      id: uid(),
      name: seed.name,
      description: seed.description,
      sku: seed.sku,
      price: money(seed.price),
      status: seed.status,
      variants,
      created_at: created,
      updated_at: updated,
    };
    return product;
  });

  return { products, optionTypes };
}

function createWorkspace(
  db: Db,
  input: {
    ownerName: string;
    email: string;
    password: string;
    businessName: string;
    plan?: string;
  },
): { user: DbUser; business: DbBusiness } {
  const businessId = uid();

  let slug = slugify(input.businessName);
  if (db.businesses.some((b) => b.slug === slug)) {
    slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const business: DbBusiness = {
    id: businessId,
    name: input.businessName,
    slug,
    plan: input.plan ?? "free",
    status: "active",
    warehouse: { id: uid(), name: "Main Warehouse", type: "warehouse" },
    channel: { id: uid(), name: "Online Store", type: "online" },
  };

  const user: DbUser = {
    id: uid(),
    name: input.ownerName,
    email: input.email,
    password: input.password,
    business_id: businessId,
  };

  db.businesses.push(business);
  db.users.push(user);
  db.catalogs[businessId] = buildCatalog();

  return { user, business };
}

/* ============================================================
   SERIALIZERS (DB -> API response shapes)
============================================================ */

function inventoryOf(variants: DbVariant[]) {
  const onHand = variants.reduce((s, v) => s + v.on_hand, 0);
  const reserved = variants.reduce((s, v) => s + v.reserved, 0);
  const version = variants.reduce((s, v) => s + v.version, 0);
  const updatedAt = variants
    .map((v) => v.inventory_updated_at)
    .sort()
    .at(-1);
  return {
    quantity_on_hand: onHand,
    quantity_reserved: reserved,
    quantity_available: Math.max(0, onHand - reserved),
    version,
    updated_at: updatedAt ?? nowIso(),
  };
}

function serializeVariant(cat: DbCatalog, v: DbVariant) {
  const option_values = v.option_value_ids
    .map((id) => {
      for (const t of cat.optionTypes) {
        const val = t.values.find((x) => x.id === id);
        if (val) {
          return {
            option_type_id: t.id,
            option_type_name: t.name,
            id: val.id,
            value: val.value,
          };
        }
      }
      return null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return {
    id: v.id,
    sku: v.sku,
    barcode: v.barcode,
    price: v.price,
    cost_price: v.cost_price,
    weight: v.weight,
    is_default: v.is_default,
    option_values,
    inventory: inventoryOf([v]),
    created_at: v.created_at,
    updated_at: v.updated_at,
  };
}

function serializeProduct(cat: DbCatalog, p: DbProduct, withVariants = false) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    sku: p.sku,
    price: p.price,
    status: p.status,
    inventory: inventoryOf(p.variants),
    ...(withVariants
      ? { variants: p.variants.map((v) => serializeVariant(cat, v)) }
      : {}),
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

function serializeUser(u: DbUser) {
  return { id: u.id, name: u.name, email: u.email, business_id: u.business_id };
}

/* ============================================================
   AUTH
============================================================ */

function issueTokens(db: Db, userId: string) {
  const access = token();
  const refresh = token();
  const now = Date.now();
  db.access_tokens[access] = { user_id: userId, expires_at: now + ACCESS_TTL_MS };
  db.refresh_tokens[refresh] = { user_id: userId, expires_at: now + REFRESH_TTL_MS };

  // Drop expired tokens so storage doesn't grow forever.
  for (const store of [db.access_tokens, db.refresh_tokens]) {
    for (const [k, t] of Object.entries(store)) {
      if (t.expires_at < now) delete store[k];
    }
  }

  return {
    access_token: access,
    refresh_token: refresh,
    access_token_expires_at: new Date(now + ACCESS_TTL_MS).toISOString(),
    refresh_token_expires_at: new Date(now + REFRESH_TTL_MS).toISOString(),
  };
}

function requireUser(db: Db, headers: Headers): { user: DbUser; business: DbBusiness; cat: DbCatalog } {
  const auth = headers.get("Authorization") ?? "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const rec = bearer ? db.access_tokens[bearer] : undefined;

  if (!rec || rec.expires_at < Date.now()) {
    throw new HttpError(401, "UNAUTHORIZED", "Authentication required.");
  }

  const user = db.users.find((u) => u.id === rec.user_id);
  if (!user) throw new HttpError(401, "UNAUTHORIZED", "Authentication required.");

  const business = db.businesses.find((b) => b.id === user.business_id);
  if (!business) {
    throw new HttpError(403, "BUSINESS_REQUIRED", "Business workspace is required.");
  }

  let cat = db.catalogs[business.id];
  if (!cat) {
    cat = buildCatalog();
    db.catalogs[business.id] = cat;
  }

  return { user, business, cat };
}

/* ============================================================
   VALIDATION HELPERS
============================================================ */

function skuTaken(cat: DbCatalog, sku: string, ignoreVariantId?: string): boolean {
  const s = sku.trim().toLowerCase();
  return cat.products.some(
    (p) =>
      // A product's own SKU is shared with its default variant, so only
      // compare against the product SKU when it has no default variant.
      (p.sku.toLowerCase() === s &&
        !p.variants.some((v) => v.is_default && v.id === ignoreVariantId)) ||
      p.variants.some((v) => v.id !== ignoreVariantId && v.sku.toLowerCase() === s),
  );
}

function assertPrice(value: unknown, field = "price"): string {
  const s = str(value).trim();
  if (!PRICE_RE.test(s) || Number(s) <= 0) {
    throw new HttpError(422, "INVALID_PRICE", "Price must be a positive amount with up to 2 decimals.", {
      [field]: "Price must be a positive amount with up to 2 decimals.",
    });
  }
  return money(s);
}

function optionalDecimal(value: unknown): string | undefined {
  const s = str(value).trim();
  if (!s) return undefined;
  if (!/^\d+(\.\d+)?$/.test(s)) {
    throw new HttpError(422, "VALIDATION_ERROR", "Invalid number.", {});
  }
  return s;
}

function findProduct(cat: DbCatalog, id: string): DbProduct {
  const p = cat.products.find((x) => x.id === id);
  if (!p) throw new HttpError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  return p;
}

function resolveOptionValueIds(cat: DbCatalog, ids: unknown): string[] {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new HttpError(422, "INVALID_VARIANT_OPTIONS", "Select at least one option value.");
  }
  const seenTypes = new Set<string>();
  for (const id of ids) {
    const type = cat.optionTypes.find((t) => t.values.some((v) => v.id === id));
    if (!type) {
      throw new HttpError(422, "INVALID_VARIANT_OPTIONS", "One or more option values don't exist.");
    }
    if (seenTypes.has(type.id)) {
      throw new HttpError(422, "INVALID_VARIANT_OPTIONS", `Pick only one value for "${type.name}".`);
    }
    seenTypes.add(type.id);
  }
  return ids as string[];
}

function sameCombination(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}

/* ============================================================
   ROUTER
============================================================ */

type Json = Record<string, unknown>;
type Result = { status: number; body?: unknown };

function handle(method: string, path: string, query: URLSearchParams, body: Json, headers: Headers): Result {
  const db = loadDb();
  const seg = path.replace(/^\/api\/v1\/?/, "").split("/").filter(Boolean);

  /* ---------------- AUTH ---------------- */

  if (seg[0] === "auth") {
    if (method === "POST" && seg[1] === "register") {
      const business_name = str(body.business_name).trim();
      const owner_name = str(body.owner_name).trim();
      const email = str(body.email).trim().toLowerCase();
      const password = str(body.password);

      const fields: Record<string, string> = {};
      if (!business_name) fields.business_name = "Business name is required.";
      if (!owner_name) fields.owner_name = "Name is required.";
      if (!EMAIL_RE.test(email)) fields.email = "Enter a valid email address.";
      if (password.length < 8) fields.password = "Password must be at least 8 characters.";
      if (Object.keys(fields).length) {
        throw new HttpError(422, "VALIDATION_ERROR", "Please fix the highlighted fields.", fields);
      }
      if (db.users.some((u) => u.email === email)) {
        throw new HttpError(409, "EMAIL_ALREADY_EXISTS", "An account with this email already exists.", {
          email: "An account with this email already exists.",
        });
      }

      const { user, business } = createWorkspace(db, {
        ownerName: owner_name,
        email,
        password,
        businessName: business_name,
      });

      return {
        status: 201,
        body: {
          ...issueTokens(db, user.id),
          user: serializeUser(user),
          business: { id: business.id, name: business.name, slug: business.slug },
        },
      };
    }

    if (method === "POST" && seg[1] === "login") {
      const email = str(body.email).trim().toLowerCase();
      const password = str(body.password);
      const user = db.users.find((u) => u.email === email);
      if (!user || user.password !== password) {
        throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
      }
      return { status: 200, body: { ...issueTokens(db, user.id), user: serializeUser(user) } };
    }

    if (method === "POST" && seg[1] === "refresh") {
      const rt = str(body.refresh_token);
      const rec = db.refresh_tokens[rt];
      if (!rec || rec.expires_at < Date.now()) {
        throw new HttpError(401, "INVALID_REFRESH_TOKEN", "Session expired. Please login again.");
      }
      delete db.refresh_tokens[rt]; // rotate
      return { status: 200, body: issueTokens(db, rec.user_id) };
    }

    if (method === "POST" && seg[1] === "logout") {
      const rt = str(body.refresh_token);
      if (!rt) {
        throw new HttpError(422, "VALIDATION_ERROR", "refresh_token is required.", {
          refresh_token: "required",
        });
      }
      delete db.refresh_tokens[rt];
      const auth = headers.get("Authorization") ?? "";
      if (auth.startsWith("Bearer ")) delete db.access_tokens[auth.slice(7)];
      return { status: 200, body: { message: "Logged out successfully." } };
    }
  }

  /* ---------------- everything below needs a session ---------------- */

  const { user, business, cat } = requireUser(db, headers);

  /* ---------------- ME / WORKSPACE ---------------- */

  if (method === "GET" && seg[0] === "me" && seg.length === 1) {
    return { status: 200, body: { user: serializeUser(user) } };
  }

  if (method === "GET" && seg[0] === "workspace" && seg.length === 1) {
    return {
      status: 200,
      body: {
        user: serializeUser(user),
        business: {
          id: business.id,
          name: business.name,
          slug: business.slug,
          plan: business.plan,
          status: business.status,
        },
        role: { name: "owner" },
        default_warehouse: business.warehouse,
        default_channel: business.channel,
      },
    };
  }

  /* ---------------- PRODUCT OPTIONS ---------------- */

  if (seg[0] === "product-options") {
    const typeId = seg[1];

    if (!typeId) {
      if (method === "GET") {
        return { status: 200, body: cat.optionTypes };
      }
      if (method === "POST") {
        const name = str(body.name).trim();
        if (!name) {
          throw new HttpError(422, "VALIDATION_ERROR", "Name is required.", { name: "Name is required." });
        }
        if (cat.optionTypes.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
          throw new HttpError(409, "OPTION_TYPE_NAME_EXISTS", "An option type with this name already exists.");
        }
        const created: DbOptionType = { id: uid(), name, values: [] };
        cat.optionTypes.push(created);
        return { status: 201, body: created };
      }
    }

    const type = cat.optionTypes.find((t) => t.id === typeId);
    if (!type) throw new HttpError(404, "OPTION_TYPE_NOT_FOUND", "Option type not found.");

    const usedIds = new Set(cat.products.flatMap((p) => p.variants.flatMap((v) => v.option_value_ids)));

    if (seg.length === 2) {
      if (method === "PATCH") {
        const name = str(body.name).trim();
        if (!name) {
          throw new HttpError(422, "VALIDATION_ERROR", "Name is required.", { name: "Name is required." });
        }
        if (cat.optionTypes.some((t) => t.id !== type.id && t.name.toLowerCase() === name.toLowerCase())) {
          throw new HttpError(409, "OPTION_TYPE_NAME_EXISTS", "An option type with this name already exists.");
        }
        type.name = name;
        return { status: 204 };
      }
      if (method === "DELETE") {
        if (type.values.some((v) => usedIds.has(v.id))) {
          throw new HttpError(
            409,
            "OPTION_TYPE_IN_USE",
            "This option type is used by existing variants and can't be deleted.",
          );
        }
        cat.optionTypes = cat.optionTypes.filter((t) => t.id !== type.id);
        return { status: 204 };
      }
    }

    if (seg[2] === "values") {
      const valueId = seg[3];

      if (!valueId && method === "POST") {
        const value = str(body.value).trim();
        if (!value) {
          throw new HttpError(422, "VALIDATION_ERROR", "Value is required.", { value: "Value is required." });
        }
        if (type.values.some((v) => v.value.toLowerCase() === value.toLowerCase())) {
          throw new HttpError(409, "OPTION_VALUE_EXISTS", `"${value}" already exists for ${type.name}.`);
        }
        const created = { id: uid(), value };
        type.values.push(created);
        return { status: 201, body: created };
      }

      const val = type.values.find((v) => v.id === valueId);
      if (!val) throw new HttpError(404, "OPTION_VALUE_NOT_FOUND", "Option value not found.");

      if (method === "PATCH") {
        const value = str(body.value).trim();
        if (!value) {
          throw new HttpError(422, "VALIDATION_ERROR", "Value is required.", { value: "Value is required." });
        }
        if (type.values.some((v) => v.id !== val.id && v.value.toLowerCase() === value.toLowerCase())) {
          throw new HttpError(409, "OPTION_VALUE_EXISTS", `"${value}" already exists for ${type.name}.`);
        }
        val.value = value;
        return { status: 204 };
      }
      if (method === "DELETE") {
        if (usedIds.has(val.id)) {
          throw new HttpError(
            409,
            "OPTION_VALUE_IN_USE",
            "This value is used by existing variants and can't be deleted.",
          );
        }
        type.values = type.values.filter((v) => v.id !== val.id);
        return { status: 204 };
      }
    }
  }

  /* ---------------- PRODUCTS ---------------- */

  if (seg[0] === "products") {
    const productId = seg[1];

    // GET /products  |  POST /products
    if (!productId) {
      if (method === "GET") {
        const limit = Math.min(Math.max(Number(query.get("limit") ?? 50) || 50, 1), 100);
        const offset = Math.max(Number(query.get("offset") ?? 0) || 0, 0);
        const sorted = [...cat.products].sort((a, b) => b.created_at.localeCompare(a.created_at));
        return {
          status: 200,
          body: {
            products: sorted.slice(offset, offset + limit).map((p) => serializeProduct(cat, p)),
            limit,
            offset,
          },
        };
      }

      if (method === "POST") {
        const name = str(body.name).trim();
        const sku = str(body.sku).trim();
        const description = str(body.description).trim();
        const variantsIn = Array.isArray(body.variants) ? (body.variants as Json[]) : [];

        const fields: Record<string, string> = {};
        if (!name) fields.name = "Name is required.";
        if (!sku) fields.sku = "SKU is required.";
        if (Object.keys(fields).length) {
          throw new HttpError(422, "VALIDATION_ERROR", "Please fix the highlighted fields.", fields);
        }
        if (skuTaken(cat, sku)) {
          throw new HttpError(409, "SKU_ALREADY_EXISTS", `SKU "${sku}" is already in use.`);
        }

        const ts = nowIso();
        let variants: DbVariant[];
        let price: string;

        if (variantsIn.length > 0) {
          const seenSkus = new Set<string>([sku.toLowerCase()]);
          const combos: string[][] = [];

          variants = variantsIn.map((row) => {
            const vSku = str(row.sku).trim();
            if (!vSku) {
              throw new HttpError(422, "VALIDATION_ERROR", "Every variant needs a SKU.");
            }
            if (seenSkus.has(vSku.toLowerCase()) || skuTaken(cat, vSku)) {
              throw new HttpError(409, "SKU_ALREADY_EXISTS", `SKU "${vSku}" is already in use.`);
            }
            seenSkus.add(vSku.toLowerCase());

            const vPrice = assertPrice(row.price);
            const qty = Number(row.initial_quantity ?? 0);
            if (!Number.isInteger(qty) || qty < 0) {
              throw new HttpError(422, "VALIDATION_ERROR", "Initial quantity must be a non-negative whole number.");
            }

            // Resolve (or auto-create) option types/values by name.
            const opts = Array.isArray(row.options) ? (row.options as Json[]) : [];
            const ids: string[] = [];
            for (const o of opts) {
              const oName = str(o.name).trim();
              const oValue = str(o.value).trim();
              if (!oName || !oValue) continue;
              let type = cat.optionTypes.find((t) => t.name.toLowerCase() === oName.toLowerCase());
              if (!type) {
                type = { id: uid(), name: oName, values: [] };
                cat.optionTypes.push(type);
              }
              let val = type.values.find((v) => v.value.toLowerCase() === oValue.toLowerCase());
              if (!val) {
                val = { id: uid(), value: oValue };
                type.values.push(val);
              }
              ids.push(val.id);
            }
            if (ids.length === 0) {
              throw new HttpError(422, "INVALID_VARIANT_OPTIONS", "Every variant needs at least one option.");
            }
            if (combos.some((c) => sameCombination(c, ids))) {
              throw new HttpError(
                409,
                "VARIANT_COMBINATION_ALREADY_EXISTS",
                "Two variants have the same option combination.",
              );
            }
            combos.push(ids);

            return {
              id: uid(),
              sku: vSku,
              barcode: str(row.barcode).trim() || undefined,
              price: vPrice,
              cost_price: money(optionalDecimal(row.cost_price) ?? 0),
              weight: optionalDecimal(row.weight),
              is_default: false,
              option_value_ids: ids,
              on_hand: qty,
              reserved: 0,
              version: 1,
              inventory_updated_at: ts,
              created_at: ts,
              updated_at: ts,
            };
          });

          price = body.price
            ? assertPrice(body.price)
            : money(Math.min(...variants.map((v) => Number(v.price))));
        } else {
          price = assertPrice(body.price);
          const qty = Number(body.initial_quantity ?? 0);
          if (!Number.isInteger(qty) || qty < 0) {
            throw new HttpError(422, "VALIDATION_ERROR", "Initial quantity must be a non-negative whole number.", {
              initial_quantity: "Initial quantity must be a non-negative whole number.",
            });
          }
          variants = [
            {
              id: uid(),
              sku,
              price,
              cost_price: money(0),
              is_default: true,
              option_value_ids: [],
              on_hand: qty,
              reserved: 0,
              version: 1,
              inventory_updated_at: ts,
              created_at: ts,
              updated_at: ts,
            },
          ];
        }

        const product: DbProduct = {
          id: uid(),
          name,
          description,
          sku,
          price,
          status: "active",
          variants,
          created_at: ts,
          updated_at: ts,
        };
        cat.products.push(product);

        return { status: 201, body: serializeProduct(cat, product, variantsIn.length > 0) };
      }
    }

    const product = findProduct(cat, productId);

    // GET / PATCH /products/:id
    if (seg.length === 2) {
      if (method === "GET") return { status: 200, body: serializeProduct(cat, product) };

      if (method === "PATCH") {
        const name = str(body.name).trim();
        if (!name) {
          throw new HttpError(422, "VALIDATION_ERROR", "Name is required.", { name: "Name is required." });
        }
        const price = assertPrice(body.price);
        const status = str(body.status) as DbProduct["status"];
        if (!["draft", "active", "archived"].includes(status)) {
          throw new HttpError(422, "VALIDATION_ERROR", "Invalid status.", { status: "Invalid status." });
        }
        product.name = name;
        product.description = str(body.description).trim();
        product.price = price;
        product.status = status;
        product.updated_at = nowIso();
        const def = product.variants.find((v) => v.is_default);
        if (def) {
          def.price = price;
          def.updated_at = product.updated_at;
        }
        return { status: 200, body: serializeProduct(cat, product) };
      }
    }

    // POST /products/:id/archive
    if (seg[2] === "archive" && method === "POST") {
      product.status = "archived";
      product.updated_at = nowIso();
      return { status: 204 };
    }

    // /products/:id/inventory[/adjustments]
    if (seg[2] === "inventory") {
      if (seg.length === 3 && method === "GET") {
        return { status: 200, body: inventoryOf(product.variants) };
      }
      if (seg[3] === "adjustments" && method === "POST") {
        const delta = Number(body.quantity_delta);
        if (!Number.isInteger(delta) || delta === 0) {
          throw new HttpError(422, "INVALID_ADJUSTMENT", "Adjustment must be a non-zero whole number.", {
            quantity_delta: "Adjustment must be a non-zero whole number.",
          });
        }
        const target = product.variants.find((v) => v.is_default) ?? product.variants[0];
        if (!target) throw new HttpError(422, "NO_VARIANT", "This product has no stock-keeping unit.");

        if (target.on_hand + delta < 0) {
          throw new HttpError(
            422,
            "INSUFFICIENT_STOCK",
            `Insufficient stock: only ${target.on_hand} unit(s) on hand.`,
          );
        }
        target.on_hand += delta;
        target.reserved = Math.min(target.reserved, target.on_hand);
        target.version += 1;
        target.inventory_updated_at = nowIso();
        return { status: 200, body: inventoryOf(product.variants) };
      }
    }

    // /products/:id/variants[/:variantId]
    if (seg[2] === "variants") {
      const variantId = seg[3];

      if (!variantId) {
        if (method === "GET") {
          const ordered = [...product.variants].sort(
            (a, b) => Number(b.is_default) - Number(a.is_default) || a.created_at.localeCompare(b.created_at),
          );
          return { status: 200, body: ordered.map((v) => serializeVariant(cat, v)) };
        }

        if (method === "POST") {
          const sku = str(body.sku).trim();
          if (!sku) throw new HttpError(422, "VALIDATION_ERROR", "SKU is required.", { sku: "SKU is required." });
          if (skuTaken(cat, sku)) {
            throw new HttpError(409, "SKU_ALREADY_EXISTS", `SKU "${sku}" is already in use.`);
          }
          const price = assertPrice(body.price);
          const ids = resolveOptionValueIds(cat, body.option_value_ids);
          if (product.variants.some((v) => sameCombination(v.option_value_ids, ids))) {
            throw new HttpError(
              409,
              "VARIANT_COMBINATION_ALREADY_EXISTS",
              "A variant with this option combination already exists.",
            );
          }
          const qty = Number(body.initial_quantity ?? 0);
          if (!Number.isInteger(qty) || qty < 0) {
            throw new HttpError(422, "VALIDATION_ERROR", "Initial quantity must be a non-negative whole number.");
          }
          const ts = nowIso();
          const variant: DbVariant = {
            id: uid(),
            sku,
            barcode: str(body.barcode).trim() || undefined,
            price,
            cost_price: money(optionalDecimal(body.cost_price) ?? 0),
            weight: optionalDecimal(body.weight),
            is_default: false,
            option_value_ids: ids,
            on_hand: qty,
            reserved: 0,
            version: 1,
            inventory_updated_at: ts,
            created_at: ts,
            updated_at: ts,
          };
          product.variants.push(variant);
          product.updated_at = ts;
          return { status: 201, body: serializeVariant(cat, variant) };
        }
      }

      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) throw new HttpError(404, "VARIANT_NOT_FOUND", "Variant not found.");

      if (method === "GET") return { status: 200, body: serializeVariant(cat, variant) };

      if (method === "PATCH") {
        const sku = str(body.sku).trim();
        if (!sku) throw new HttpError(422, "VALIDATION_ERROR", "SKU is required.", { sku: "SKU is required." });
        if (skuTaken(cat, sku, variant.id) && sku.toLowerCase() !== variant.sku.toLowerCase()) {
          throw new HttpError(409, "SKU_ALREADY_EXISTS", `SKU "${sku}" is already in use.`);
        }
        const price = assertPrice(body.price);
        const ids = variant.is_default && (!Array.isArray(body.option_value_ids) || body.option_value_ids.length === 0)
          ? []
          : resolveOptionValueIds(cat, body.option_value_ids);
        if (product.variants.some((v) => v.id !== variant.id && sameCombination(v.option_value_ids, ids))) {
          throw new HttpError(
            409,
            "VARIANT_COMBINATION_ALREADY_EXISTS",
            "A variant with this option combination already exists.",
          );
        }
        variant.sku = sku;
        variant.barcode = str(body.barcode).trim() || undefined;
        variant.price = price;
        variant.cost_price = money(optionalDecimal(body.cost_price) ?? 0);
        variant.weight = optionalDecimal(body.weight);
        variant.option_value_ids = ids;
        variant.updated_at = nowIso();
        if (variant.is_default) {
          product.sku = sku;
          product.price = price;
        }
        product.updated_at = variant.updated_at;
        return { status: 200, body: serializeVariant(cat, variant) };
      }
    }
  }

  throw new HttpError(404, "NOT_FOUND", `No route for ${method} ${path}.`);
}

/* ============================================================
   fetch()-COMPATIBLE ENTRY POINT
============================================================ */

function jsonResponse(status: number, body?: unknown): Response {
  if (status === 204 || body === undefined) {
    return new Response(null, { status: status === 200 ? 204 : status });
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(err: HttpError): Response {
  const payload: ApiErrorResponse = {
    error: {
      code: err.code,
      message: err.message,
      ...(err.fields ? { fields: err.fields } : {}),
    },
  };
  return jsonResponse(err.status, payload);
}

function delay(): Promise<void> {
  // A little latency so loading states behave like they do against a real API.
  const ms = 180 + Math.floor(Math.random() * 220);
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Drop-in replacement for `fetch()` for API calls. Accepts a relative
 * endpoint such as "/api/v1/products?limit=20" and returns a real Response.
 */
export async function mockFetch(endpoint: string, init: RequestInit = {}): Promise<Response> {
  await delay();

  if (typeof window === "undefined") {
    return errorResponse(new HttpError(503, "UNAVAILABLE", "The demo API runs in the browser only."));
  }

  const url = new URL(endpoint, "http://demo.local");
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);

  let body: Json = {};
  if (typeof init.body === "string" && init.body) {
    try {
      body = JSON.parse(init.body) as Json;
    } catch {
      return errorResponse(new HttpError(400, "INVALID_JSON", "Request body must be valid JSON."));
    }
  }

  try {
    const result = handle(method, url.pathname, url.searchParams, body, headers);
    saveDb();
    return jsonResponse(result.status, result.body);
  } catch (err) {
    if (err instanceof HttpError) {
      saveDb();
      return errorResponse(err);
    }
    console.error("[demo api] unexpected error", err);
    return errorResponse(new HttpError(500, "INTERNAL_ERROR", "Something went wrong. Please try again."));
  }
}
