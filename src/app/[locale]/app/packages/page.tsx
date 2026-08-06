import { PackagesClient } from './packages-client';

export default function PackagesPage() {
  const isSandbox = process.env.PAYPAL_MODE !== 'live';
  return <PackagesClient isSandbox={isSandbox} />;
}
