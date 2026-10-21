import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import { useCartContext } from '../context/CartContext';
import DeliveryAddressSelector from '../components/checkout/DeliveryAddressSelector';
import type { AddressResponse } from '../api/addressApi';
import { createCartCheckout } from '../api/cartApi';
import { verifyRazorpayPayment } from '../api/paymentApi';
import { loadRazorpay, openRazorpayCheckout, type RazorpayPaymentResponse } from '../utils/razorpay';
import { useAuth } from '../context/AuthContext';
import { OfferCheckoutSection, type AppliedOffer } from '../components/checkout/OfferCheckoutSection';
import { StockBadge } from '../components/common/StockBadge';
import { ApiError } from '../api/apiClient';
import { checkDeliveryAvailability, type DeliveryCheckResult } from '../api/deliveryApi';
import { validateDeliveryPincode } from '../utils/deliveryValidation';

type ProductDeliveryStatus =
  | { status: 'checking' }
  | { status: 'available'; result: DeliveryCheckResult }
  | { status: 'unavailable' }
  | { status: 'invalid' }
  | { status: 'error' };

type CartDeliveryValidation = {
  key: string;
  results: Record<number, ProductDeliveryStatus>;
};

export function CustomerCartPage() {
  const { cart, isLoading, error, updateItem, removeItem, refresh } = useCartContext();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedAddress, setSelectedAddress] = useState<AddressResponse | null>(null);
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [deliveryValidation, setDeliveryValidation] = useState<CartDeliveryValidation | null>(null);
  const [appliedOffer, setAppliedOffer] = useState<AppliedOffer | null>(null);
  const checkoutPending = useRef(false);
  const distinctProductIds = [...new Set(cart.items.map((item) => item.productId))];
  const deliveryCheckKey = `${selectedAddress?.id ?? ''}:${selectedAddress?.postalCode ?? ''}:${distinctProductIds.join(',')}`;
  const currentDeliveryResults = deliveryValidation?.key === deliveryCheckKey ? deliveryValidation.results : {};
  const deliveryReady = Boolean(selectedAddress)
    && distinctProductIds.length > 0
    && distinctProductIds.every((productId) => currentDeliveryResults[productId]?.status === 'available');
  const deliveryChecking = distinctProductIds.some((productId) => currentDeliveryResults[productId]?.status === 'checking');

  useEffect(() => {
    if (!selectedAddress) return undefined;

    const controller = new AbortController();
    const initialResults: Record<number, ProductDeliveryStatus> = {};
    for (const productId of distinctProductIds) {
      initialResults[productId] = validateDeliveryPincode(selectedAddress.postalCode) && Number.isInteger(productId) && productId > 0
        ? { status: 'checking' }
        : { status: 'invalid' };
    }
    setDeliveryValidation({ key: deliveryCheckKey, results: initialResults });

    if (!validateDeliveryPincode(selectedAddress.postalCode)) return () => controller.abort();

    void Promise.all(distinctProductIds.map(async (productId) => {
      if (!Number.isInteger(productId) || productId <= 0) {
        return [productId, { status: 'invalid' } satisfies ProductDeliveryStatus] as const;
      }
      try {
        const result = await checkDeliveryAvailability(
          { productId, pincode: selectedAddress.postalCode },
          controller.signal,
        );
        const status: ProductDeliveryStatus = !result.success
          ? { status: 'invalid' }
          : result.deliveryAvailable === true
            ? { status: 'available', result }
            : result.deliveryAvailable === false
              ? { status: 'unavailable' }
              : { status: 'error' };
        return [productId, status] as const;
      } catch (reason) {
        const status: ProductDeliveryStatus = reason instanceof ApiError && [400, 422].includes(reason.status)
          ? { status: 'invalid' }
          : { status: 'error' };
        return [productId, status] as const;
      }
    })).then((entries) => {
      if (controller.signal.aborted) return;
      setDeliveryValidation({ key: deliveryCheckKey, results: Object.fromEntries(entries) });
    });

    return () => controller.abort();
  }, [deliveryCheckKey, selectedAddress?.postalCode, distinctProductIds.join(',')]);

  const handleQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    setPendingItemId(itemId);
    try {
      await updateItem(itemId, quantity);
      setAppliedOffer(null);
    } finally {
      setPendingItemId(null);
    }
  };

  const handleRemove = async (itemId: number) => {
    setPendingItemId(itemId);
    try {
      await removeItem(itemId);
      setAppliedOffer(null);
    } finally {
      setPendingItemId(null);
    }
  };

  const handleCheckout = async () => {
    if (checkoutPending.current) return;
    if (!selectedAddress) {
      setCheckoutError('Please select a delivery address before continuing.');
      return;
    }
    if (!deliveryReady) {
      setCheckoutError('Confirm delivery availability for every cart product before checkout.');
      return;
    }
    if (cart.items.length === 0 || checkoutLoading) return;

    checkoutPending.current = true;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const payment = await createCartCheckout(selectedAddress.id, appliedOffer?.offerId ?? undefined, appliedOffer?.sourceCode);
      if (!(await loadRazorpay()) || !window.Razorpay) throw new Error('Razorpay Checkout could not be loaded.');

      const orderId = payment.orderId ?? payment.internalOrderId;
      if (!orderId) throw new Error('Cart checkout did not return an order ID.');
      if (!payment.razorpayKeyId || !payment.razorpayOrderId || payment.amount === undefined || payment.currency === undefined) {
        throw new Error('Cart checkout did not return complete Razorpay payment details.');
      }

      openRazorpayCheckout({
        key: payment.razorpayKeyId,
        order_id: payment.razorpayOrderId,
        amount: payment.amount,
        currency: payment.currency,
        name: 'Bidzo Marketplace',
        description: `Cart checkout (${cart.items.length} items)`,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            await verifyRazorpayPayment(orderId, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            await refresh();
            navigate(`/customer/orders/${orderId}`);
          } catch (reason) {
            setCheckoutError(reason instanceof Error ? reason.message : 'Payment verification failed.');
            checkoutPending.current = false;
            setPaymentOpen(false);
          }
        },
        modal: {
          ondismiss: () => {
            setCheckoutError('Payment was cancelled.');
            checkoutPending.current = false;
            setPaymentOpen(false);
          },
        },
      });
      setPaymentOpen(true);
    } catch (reason) {
      setCheckoutError(reason instanceof Error ? reason.message : 'Unable to start checkout.');
      checkoutPending.current = false;
      setPaymentOpen(false);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <SectionShell title="Cart" subtitle="Review your Direct Buy items before checkout">
      {isLoading ? <p className="py-12 text-center text-slate-400">Loading your cart...</p> : error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-5 text-rose-200">{error}</p> : cart.items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-8 text-center text-slate-400"><ShoppingBag className="mx-auto mb-3 h-10 w-10 text-slate-600" /><p>Your cart is empty</p></div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <img src={item.productImageUrl || '/logo.png'} alt={item.productName} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/logo.png'; }} className="h-24 w-24 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1"><h3 className="font-semibold text-white">{item.productName}</h3><p className="mt-1 text-sm text-slate-400">₹{item.unitPrice.toLocaleString()} each</p><StockBadge availableQuantity={item.availableQuantity} className="mt-1" />{item.availableQuantity !== null && item.availableQuantity !== undefined && item.quantity > item.availableQuantity ? <p className="mt-1 text-xs font-semibold text-rose-300">Requested quantity exceeds available stock</p> : null}</div>
                <div className="flex items-center gap-2"><button type="button" aria-label="Decrease quantity" disabled={pendingItemId === item.id || item.quantity <= 1} onClick={() => handleQuantity(item.id, item.quantity - 1)} className="rounded-full border border-white/10 p-2 text-slate-200 disabled:opacity-40"><Minus className="h-4 w-4" /></button><span className="min-w-8 text-center text-white">{item.quantity}</span><button type="button" aria-label="Increase quantity" disabled={pendingItemId === item.id} onClick={() => handleQuantity(item.id, item.quantity + 1)} className="rounded-full border border-white/10 p-2 text-slate-200 disabled:opacity-40"><Plus className="h-4 w-4" /></button></div>
                <div className="min-w-24 text-right font-semibold text-white">₹{item.subtotal.toLocaleString()}</div>
                <button type="button" aria-label={`Remove ${item.productName}`} disabled={pendingItemId === item.id} onClick={() => handleRemove(item.id)} className="rounded-full p-2 text-rose-300 hover:bg-rose-500/10 disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          <aside className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold text-white">Cart summary</h2><div className="mt-4 flex justify-between text-sm text-slate-300"><span>Total</span><span className="text-xl font-semibold text-white">₹{(appliedOffer?.finalAmount ?? cart.total).toLocaleString()}</span></div>{appliedOffer ? <div className="mt-2 flex justify-between text-sm text-emerald-300"><span>Offer discount</span><span>-₹{Number(appliedOffer.discountAmount || 0).toLocaleString('en-IN')}</span></div> : null}
            <div className="mt-4"><DeliveryAddressSelector selectedAddressId={selectedAddress?.id} onSelect={(address) => { setSelectedAddress(address); setDeliveryValidation(null); setCheckoutError(null); }} /></div>
            {selectedAddress ? (
              <section className="mt-4 space-y-2" aria-labelledby="cart-delivery-check-heading" aria-live="polite">
                <h3 id="cart-delivery-check-heading" className="text-sm font-semibold text-white">Delivery availability</h3>
                {cart.items.map((item) => {
                  const productDeliveryStatus = currentDeliveryResults[item.productId];
                  const status = productDeliveryStatus?.status ?? 'checking';
                  const result = productDeliveryStatus?.status === 'available' ? productDeliveryStatus.result : null;
                  const message = status === 'available'
                    ? 'Delivery is available to your PIN code.'
                    : status === 'unavailable'
                      ? 'Sorry, delivery is not available to this PIN code.'
                      : status === 'invalid'
                        ? 'Unable to verify delivery for this PIN code. Please check the PIN code and try again.'
                        : status === 'error'
                          ? 'Unable to check delivery availability. Please try again.'
                          : 'Checking delivery availability...';
                  return (
                    <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                      <p className="font-medium text-slate-200">{item.productName}</p>
                      <p className={`mt-1 ${status === 'available' ? 'text-emerald-300' : status === 'checking' ? 'text-slate-400' : 'text-rose-300'}`}>{message}</p>
                      {result ? (
                        <p className="mt-1 text-xs text-slate-400">
                          {typeof result.distanceKm === 'number' ? `Distance: ${result.distanceKm} km` : null}
                          {typeof result.distanceKm === 'number' && typeof result.configuredRadiusKm === 'number' ? ' · ' : null}
                          {typeof result.configuredRadiusKm === 'number' ? `Delivery radius: ${result.configuredRadiusKm} km` : null}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </section>
            ) : null}
            <div className="mt-4"><OfferCheckoutSection orderAmount={cart.total} productIds={cart.items.map((item) => item.productId)} categoryIds={cart.items.flatMap((item) => item.categoryId == null ? [] : [item.categoryId])} onApplied={setAppliedOffer} onRemoved={() => setAppliedOffer(null)} /></div>
            {checkoutError ? <p className="mt-4 text-sm text-rose-200">{checkoutError}</p> : null}
            <button type="button" disabled={checkoutLoading || paymentOpen || !deliveryReady} onClick={handleCheckout} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-50">{checkoutLoading ? 'Preparing payment...' : paymentOpen ? 'Payment window open' : deliveryChecking ? 'Checking delivery...' : 'Checkout with Razorpay'}<ArrowRight className="h-4 w-4" /></button>
          </aside>
        </div>
      )}
    </SectionShell>
  );
}
