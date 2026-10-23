export const DELIVERY_SHARE_ROUTE_PATH = '/delivery-share/:token';

const BACKEND_DELIVERY_SHARE_PATH = /^\/api\/public\/delivery-shares\/view\/([^/]+)$/;

export function toFrontendDeliveryShareUrl(shareUrl: string, frontendOrigin: string): string {
  let backendUrl: URL;
  let frontendUrl: URL;
  try {
    backendUrl = new URL(shareUrl, frontendOrigin);
    frontendUrl = new URL(frontendOrigin);
  } catch {
    throw new Error('Delivery share response did not contain a valid share URL.');
  }

  const match = backendUrl.pathname.match(BACKEND_DELIVERY_SHARE_PATH);
  if (!match) {
    throw new Error('Delivery share response did not contain a recognized delivery token URL.');
  }

  let token: string;
  try {
    token = decodeURIComponent(match[1]);
  } catch {
    throw new Error('Delivery share response contained an invalid delivery token.');
  }
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
    throw new Error('Delivery share response contained an invalid delivery token.');
  }

  return new URL(`/delivery-share/${encodeURIComponent(token)}`, frontendUrl.origin).href;
}
