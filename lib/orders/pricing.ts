// Order pricing rules, shared by the demo API and the Create Order form so the
// totals a user previews are exactly the totals that get saved.
//
// Demo rules (not tax advice):
// - Prices are GST-inclusive, as is usual for Indian retail. The GST portion
//   is shown for information at 5% for items up to ₹2,500 and 18% above.
// - Shipping is free when the order (after discount) is ₹999 or more,
//   otherwise ₹79. In-store (POS) orders never pay shipping.

export interface DiscountCode {
  code: string;
  label: string;
  percent?: number;
  flat?: number;
  maxOff?: number;
  minSubtotal?: number;
}

export const DISCOUNT_CODES: DiscountCode[] = [
  { code: "WELCOME10", label: "10% off first order (up to ₹300)", percent: 10, maxOff: 300 },
  { code: "FESTIVE15", label: "15% off festive sale (up to ₹750)", percent: 15, maxOff: 750 },
  { code: "FLAT200", label: "₹200 off orders above ₹1,499", flat: 200, minSubtotal: 1499 },
];

export const FREE_SHIPPING_MIN = 999;
export const SHIPPING_FEE = 79;

export function findDiscount(code?: string): DiscountCode | undefined {
  if (!code) return undefined;
  const c = code.trim().toUpperCase();
  return DISCOUNT_CODES.find((d) => d.code === c);
}

export function gstRate(unitPrice: number): number {
  return unitPrice > 2500 ? 18 : 5;
}

export interface PricingLine {
  unitPrice: number;
  quantity: number;
}

export interface PricingResult {
  subtotal: number;
  discount: number;
  shipping: number;
  taxIncluded: number;
  total: number;
  discountError?: string;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function priceOrder(
  lines: PricingLine[],
  options: { discountCode?: string; inStore?: boolean } = {},
): PricingResult {
  const subtotal = round2(lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0));

  let discount = 0;
  let discountError: string | undefined;
  if (options.discountCode && options.discountCode.trim()) {
    const d = findDiscount(options.discountCode);
    if (!d) {
      discountError = "This discount code doesn't exist.";
    } else if (d.minSubtotal && subtotal < d.minSubtotal) {
      discountError = `${d.code} needs a subtotal of at least ₹${d.minSubtotal.toLocaleString("en-IN")}.`;
    } else if (d.percent) {
      discount = Math.min((subtotal * d.percent) / 100, d.maxOff ?? Infinity);
    } else if (d.flat) {
      discount = d.flat;
    }
  }
  discount = round2(Math.min(discount, subtotal));

  const afterDiscount = subtotal - discount;
  const shipping =
    options.inStore || lines.length === 0 || afterDiscount >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;

  // GST is already inside the item prices; scale it by the discount share.
  const factor = subtotal > 0 ? afterDiscount / subtotal : 0;
  const taxIncluded = round2(
    lines.reduce((s, l) => {
      const r = gstRate(l.unitPrice);
      return s + ((l.unitPrice * l.quantity * r) / (100 + r)) * factor;
    }, 0),
  );

  return {
    subtotal,
    discount,
    shipping,
    taxIncluded,
    total: round2(afterDiscount + shipping),
    discountError,
  };
}
