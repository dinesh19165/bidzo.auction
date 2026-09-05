import { useState } from 'react';
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

export function CustomerCartPage() {
  const { cart, isLoading, error, updateItem, removeItem, refresh } = useCartContext();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedAddress, setSelectedAddress] = useState<AddressResponse | null>(null);
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    setPendingItemId(itemId);
    try {
      await updateItem(itemId, quantity);
    } finally {
      setPendingItemId(null);
    }
  };

  const handleRemove = async (itemId: number) => {
    setPendingItemId(itemId);
    try {
      await removeItem(itemId);
    } finally {
      setPendingItemId(null);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      setCheckoutError('Please select a delivery address before continuing.');
      return;
    }
    if (cart.items.length === 0 || checkoutLoading) return;

    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const payment = await createCartCheckout(selectedAddress.id);
      if (!(await loadRazorpay()) || !window.Razorpay) throw new Error('Razorpay Checkout could not be loaded.');

      const orderId = payment.orderId ?? payment.internalOrderId;
      if (!orderId) throw new Error('Cart checkout did not return an order ID.');

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
          }
        },
        modal: { ondismiss: () => setCheckoutError('Payment was cancelled.') },
      });
    } catch (reason) {
      setCheckoutError(reason instanceof Error ? reason.message : 'Unable to start checkout.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <SectionShell title="Cart" subtitle="Review your Direct Buy items before checkout">
      {isLoading ? <p className="py-12 text-center text-slate-400">Loading your cart...</p> : error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-5 text-rose-200">{error}</p> : cart.items.length === 0 ? (
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-12 text-center text-slate-400"><ShoppingBag className="mx-auto mb-4 h-10 w-10 text-slate-600" /><p>Your cart is empty</p></div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center gap-4 rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
                <img src={item.productImageUrl || '/logo.png'} alt={item.productName} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/logo.png'; }} className="h-24 w-24 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1"><h3 className="font-semibold text-white">{item.productName}</h3><p className="mt-1 text-sm text-slate-400">₹{item.unitPrice.toLocaleString()} each</p></div>
                <div className="flex items-center gap-2"><button type="button" aria-label="Decrease quantity" disabled={pendingItemId === item.id || item.quantity <= 1} onClick={() => handleQuantity(item.id, item.quantity - 1)} className="rounded-full border border-white/10 p-2 text-slate-200 disabled:opacity-40"><Minus className="h-4 w-4" /></button><span className="min-w-8 text-center text-white">{item.quantity}</span><button type="button" aria-label="Increase quantity" disabled={pendingItemId === item.id} onClick={() => handleQuantity(item.id, item.quantity + 1)} className="rounded-full border border-white/10 p-2 text-slate-200 disabled:opacity-40"><Plus className="h-4 w-4" /></button></div>
                <div className="min-w-24 text-right font-semibold text-white">₹{item.subtotal.toLocaleString()}</div>
                <button type="button" aria-label={`Remove ${item.productName}`} disabled={pendingItemId === item.id} onClick={() => handleRemove(item.id)} className="rounded-full p-2 text-rose-300 hover:bg-rose-500/10 disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          <aside className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-lg font-semibold text-white">Cart summary</h2><div className="mt-5 flex justify-between text-sm text-slate-300"><span>Total</span><span className="text-xl font-semibold text-white">₹{cart.total.toLocaleString()}</span></div>
            <div className="mt-6"><DeliveryAddressSelector selectedAddressId={selectedAddress?.id} onSelect={setSelectedAddress} /></div>
            {checkoutError ? <p className="mt-4 text-sm text-rose-200">{checkoutError}</p> : null}
            <button type="button" disabled={checkoutLoading} onClick={handleCheckout} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-50">{checkoutLoading ? 'Preparing payment...' : 'Checkout with Razorpay'}<ArrowRight className="h-4 w-4" /></button>
          </aside>
        </div>
      )}
    </SectionShell>
  );
}
