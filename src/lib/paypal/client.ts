import { getPayPalAccessToken, getPayPalApiBase } from '@/lib/paypal';

/**
 * The only three PayPal calls the checkout needs, in one place.
 *
 * Returned as data, never thrown: a network blip and a declined card are
 * different situations and the caller must be able to tell them apart.
 */

export interface CaptureUnit {
  custom_id?: string;
  invoice_id?: string;
  payee?: { merchant_id?: string };
  payments?: {
    captures?: {
      id?: string;
      status?: string;
      amount?: { currency_code?: string; value?: string };
      payee?: { merchant_id?: string };
    }[];
  };
}

export interface OrderState {
  id: string;
  status: string; // CREATED | SAVED | APPROVED | COMPLETED | VOIDED | PAYER_ACTION_REQUIRED
  payer?: { payer_id?: string };
  purchase_units?: CaptureUnit[];
  links?: { rel?: string; href?: string }[];
}

export interface CaptureView {
  paypalOrderId: string;
  captureId: string;
  captureStatus: string;
  amountCents: number;
  currency: string;
  merchantId: string | null;
  payerId: string | null;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; issue: string | null; message: string };

async function call<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  const accessToken = await getPayPalAccessToken();
  const res = await fetch(`${getPayPalApiBase()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const b = body as { message?: string; name?: string; details?: { issue?: string }[] };
    return {
      ok: false,
      status: res.status,
      issue: b?.details?.[0]?.issue ?? b?.name ?? null,
      message: b?.message ?? `PayPal ${res.status}`,
    };
  }
  return { ok: true, data: body as T };
}

/** POST /v2/checkout/orders — idempotent when requestId is supplied. */
export async function createPayPalOrder(input: {
  requestId: string;
  ref: string;
  planCode: string;
  amountCents: number;
  currency: string;
  description: string;
  merchantId: string;
  brandName?: string;
}): Promise<ApiResult<OrderState>> {
  return call<OrderState>('/v2/checkout/orders', {
    method: 'POST',
    headers: { 'PayPal-Request-Id': input.requestId },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: input.planCode,
          invoice_id: input.ref,
          custom_id: input.ref,
          description: input.description,
          amount: {
            currency_code: input.currency,
            value: (input.amountCents / 100).toFixed(2),
          },
          payee: { merchant_id: input.merchantId },
        },
      ],
      application_context: {
        brand_name: input.brandName ?? 'Muqabaleh',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
      },
    }),
  });
}

/** GET /v2/checkout/orders/{id} */
export async function getPayPalOrder(paypalOrderId: string): Promise<ApiResult<OrderState>> {
  return call<OrderState>(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`);
}

/** POST /v2/checkout/orders/{id}/capture — idempotent per requestId. */
export async function capturePayPalOrder(
  paypalOrderId: string,
  requestId: string,
): Promise<ApiResult<OrderState>> {
  return call<OrderState>(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: 'POST',
    headers: { 'PayPal-Request-Id': requestId },
  });
}

/** POST /v2/payments/captures/{id}/refund */
export async function refundCapture(
  captureId: string,
  note: string,
): Promise<ApiResult<unknown>> {
  return call<unknown>(`/v2/payments/captures/${encodeURIComponent(captureId)}/refund`, {
    method: 'POST',
    body: JSON.stringify({ note_to_payer: note }),
  });
}

/** Flatten a PayPal order into the facts the grant logic needs. */
export function captureViewOf(order: OrderState): CaptureView | null {
  const unit = order.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  if (!capture?.id) return null;
  const value = capture.amount?.value;
  const cents = value === undefined ? NaN : Math.round(Number.parseFloat(value) * 100);
  if (!Number.isFinite(cents)) return null;
  return {
    paypalOrderId: order.id,
    captureId: capture.id,
    captureStatus: capture.status ?? 'UNKNOWN',
    amountCents: cents,
    currency: capture.amount?.currency_code ?? '',
    merchantId: capture.payee?.merchant_id ?? unit?.payee?.merchant_id ?? null,
    payerId: order.payer?.payer_id ?? null,
  };
}
