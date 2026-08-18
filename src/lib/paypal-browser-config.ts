export type PayPalBrowserConfig = {
  clientId: string;
  mode: 'live' | 'sandbox';
  jeannieSubscriptions: boolean;
};

export async function fetchPayPalBrowserConfig(): Promise<PayPalBrowserConfig> {
  try {
    const res = await fetch('/api/paypal/public-config', { cache: 'no-store' });
    if (!res.ok) {
      return { clientId: '', mode: 'sandbox', jeannieSubscriptions: false };
    }
    const data = (await res.json()) as Partial<PayPalBrowserConfig>;
    return {
      clientId: String(data.clientId || '').trim(),
      mode: data.mode === 'live' ? 'live' : 'sandbox',
      jeannieSubscriptions: Boolean(data.jeannieSubscriptions),
    };
  } catch {
    return { clientId: '', mode: 'sandbox', jeannieSubscriptions: false };
  }
}
