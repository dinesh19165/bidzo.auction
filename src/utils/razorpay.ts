export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  handler: (response: RazorpayPaymentResponse) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayInstance {
  open(): void;
}

export interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
let razorpayLoading: Promise<boolean> | null = null;

const isRazorpayReady = () => typeof window !== 'undefined' && typeof window.Razorpay === 'function';

export function loadRazorpay(): Promise<boolean> {
  if (isRazorpayReady()) return Promise.resolve(true);
  if (razorpayLoading) return razorpayLoading;

  razorpayLoading = new Promise<boolean>((resolve, reject) => {
    const existingScript = Array.from(document.scripts).find(
      (script) => script.src === RAZORPAY_SCRIPT_URL || script.getAttribute('src') === RAZORPAY_SCRIPT_URL,
    );
    const script = existingScript ?? document.createElement('script');

    const handleLoad = () => {
      if (isRazorpayReady()) {
        resolve(true);
      } else {
        reject(new Error('Razorpay Checkout could not be loaded.'));
      }
    };
    const handleError = () => reject(new Error('Razorpay Checkout could not be loaded.'));

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });

    if (!existingScript) {
      script.src = RAZORPAY_SCRIPT_URL;
      script.async = true;
      document.head.appendChild(script);
    }
  }).catch((error) => {
    razorpayLoading = null;
    throw error;
  });

  return razorpayLoading;
}
