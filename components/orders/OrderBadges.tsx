import type { FulfillmentStatus, PaymentStatus } from "@/types/order";
import {
  FULFILLMENT_BADGE,
  FULFILLMENT_LABEL,
  PAYMENT_BADGE,
  PAYMENT_STATUS_LABEL,
} from "@/lib/orders/format";

const base =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-bold";

export function FulfillmentBadge({ status }: { status: FulfillmentStatus }) {
  return (
    <span className={`${base} ${FULFILLMENT_BADGE[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {FULFILLMENT_LABEL[status]}
    </span>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <span className={`${base} ${PAYMENT_BADGE[status]}`}>{PAYMENT_STATUS_LABEL[status]}</span>;
}
