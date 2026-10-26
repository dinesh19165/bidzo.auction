import { useState, useEffect, useRef } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, CreditCard, Info, Loader2, MapPin, PackageCheck, ShieldCheck, Star, WalletCards } from 'lucide-react';
import { SectionShell } from '../../components/SectionShell';
import { useAuth } from '../../context/AuthContext';
import { createRazorpayPayment, verifyRazorpayPayment } from '../../api/paymentApi';
import { createProductImage, createBuyNowOrder, getProductById, type ProductListItem } from '../../api/productApi';
import { getLoyaltyBalance, getLoyaltyRedeemQuote, type LoyaltyBalanceResponse, type LoyaltyRedeemQuoteResponse } from '../../api/loyaltyApi';
import { getRewardsSummary } from '../../api/rewardsApi';
import { cancelOrder, getOrderById, isConfirmedOrderStatus, isPaidStatus } from '../../api/orderApi';
import { getPaymentsForOrder } from '../../api/paymentApi';
import { readBuyNowFlowState, writeBuyNowFlowState, initializeBuyNowFlow, startBuyNowPayment, markBuyNowOrderConfirmed, markBuyNowInvoiceReady, clearBuyNowFlowState } from '../../utils/auctionFlowState';
import { loadRazorpay, type RazorpayInstance, type RazorpayOptions, type RazorpayPaymentResponse } from '../../utils/razorpay';
import DeliveryAddressSelector from '../../components/checkout/DeliveryAddressSelector';
import DeliveryAvailabilityCheck from '../../components/delivery/DeliveryAvailabilityCheck';
import { OfferCheckoutSection, type AppliedOffer } from '../../components/checkout/OfferCheckoutSection';
import type { AddressResponse } from '../../api/addressApi';
import { hasVerifiedCoordinates } from '../../components/checkout/DeliveryLocationPicker';
import { getInvoiceByOrderId, downloadInvoice, type InvoiceResponse } from '../../api/invoiceApi';
import { InvoiceDocument, InvoicePdfDownloadButton } from '../../components/invoices/InvoiceDocument';
import type { OrderResponseDto, PaymentResponseDto } from '../../types';

function FlowTransitionScreen({ heading, message, detail }: { heading: string; message: string; detail?: string }) {
  return (
    <SectionShell title={heading} subtitle={message}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35 }}
        className="mx-auto mt-6 flex max-w-3xl flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-6 text-center text-slate-300"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-slate-950/60">
          <Loader2 className="h-10 w-10 animate-spin text-blue-300" />
        </div>
        <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Please wait</p>
        <h3 className="text-2xl font-semibold text-white">{heading}</h3>
        <p className="max-w-xl text-sm text-slate-400">{detail ?? 'This should only take a few seconds.'}</p>
      </motion.div>
    </SectionShell>
  );
}

export function BuyNowConfirmPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const flowState = readBuyNowFlowState();
  const orderCreationPending = useRef(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressResponse | null>(null);
  const [deliveryAvailable, setDeliveryAvailable] = useState<boolean | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [useWallet, setUseWallet] = useState(false);
  const [walletUsage, setWalletUsage] = useState('');
  const [loyaltyBalance, setLoyaltyBalance] = useState<LoyaltyBalanceResponse | null>(null);
  const [loyaltyLoading, setLoyaltyLoading] = useState(true);
  const [loyaltyPoints, setLoyaltyPoints] = useState('');
  const [loyaltyQuote, setLoyaltyQuote] = useState<LoyaltyRedeemQuoteResponse | null>(null);
  const [loyaltyError, setLoyaltyError] = useState<string | null>(null);
  const [appliedOffer, setAppliedOffer] = useState<AppliedOffer | null>(null);
  const [currentProduct, setCurrentProduct] = useState<ProductListItem | null>(null);
  const [productContextError, setProductContextError] = useState<string | null>(null);
  const subtotal = Number(flowState.productPrice);

  useEffect(() => {
    let active = true;
    if (!flowState.productId) return undefined;
    setCurrentProduct(null);
    setProductContextError(null);
    getProductById(flowState.productId).then((product) => {
      if (!active) return;
      console.log('BUY NOW PRODUCT RAW', product);
      if (product.categoryId === null || product.categoryId === undefined) {
        setProductContextError('Product category information is unavailable. Please refresh and try again.');
        return;
      }
      setCurrentProduct(product);
    }).catch((reason) => {
      if (active) setProductContextError(reason instanceof Error ? reason.message : 'Unable to load the current product.');
    });
    return () => { active = false; };
  }, [flowState.productId]);

  useEffect(() => {
    getRewardsSummary().then((summary) => {
      const rawBalance = summary.availableBalance;
      const parsedBalance = Number(rawBalance);
      if (!Number.isFinite(parsedBalance)) throw new Error('Rewards summary did not include a valid availableBalance.');
      setWalletBalance(parsedBalance);
      setWalletError(null);
    }).catch((reason: unknown) => {
      setWalletBalance(null);
      setWalletError(reason instanceof Error ? reason.message : 'Unable to load wallet balance.');
    });
  }, []);

  useEffect(() => {
    let active = true;
    setLoyaltyLoading(true);
    setLoyaltyError(null);
    setLoyaltyQuote(null);
    setLoyaltyPoints('');
    getLoyaltyBalance(subtotal).then((balance) => {
      if (active) setLoyaltyBalance(balance);
    }).catch(() => {
      if (active) setLoyaltyError('Unable to load loyalty points.');
    }).finally(() => {
      if (active) setLoyaltyLoading(false);
    });
    return () => { active = false; };
  }, [selectedAddress?.id, subtotal]);

  const loyaltyDiscountPreview = loyaltyQuote?.discountAmount ?? 0;
  const walletMaximum = Math.max(0, Math.min(walletBalance ?? 0, subtotal - loyaltyDiscountPreview));

  useEffect(() => {
    if (!useWallet) return;
    setWalletUsage(walletMaximum > 0 ? String(walletMaximum) : '');
  }, [useWallet, walletMaximum]);

  if (!flowState.productId) {
    return <Navigate to="/marketplace" replace />;
  }

  const handleConfirmAndPay = async () => {
    if (orderCreationPending.current || loading) return;
    // Validate terms
    if (!termsAccepted) {
      setError('Please accept the terms and conditions to proceed');
      return;
    }
    if (!selectedAddress) {
      setError('Please select a delivery address before continuing to payment.');
      return;
    }
    if (!hasVerifiedCoordinates(selectedAddress.latitude, selectedAddress.longitude)) {
      setError('This saved address has no confirmed delivery location. Update it in your address book before continuing.');
      return;
    }
    if (deliveryAvailable !== true) {
      setError(deliveryAvailable === false
        ? 'Sorry, delivery is not available to this PIN code.'
        : 'Unable to check delivery availability. Please try again.');
      return;
    }
    const quantity = flowState.quantity ?? 1;
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError('The purchase quantity is invalid. Please return to the product and try again.');
      return;
    }

    orderCreationPending.current = true;
    setLoading(true);
    setError(null);
    let orderCreated = false;

    try {
      const latestProduct = await getProductById(flowState.productId);
      if (latestProduct.availableQuantity != null && quantity > latestProduct.availableQuantity) {
        throw new Error('The selected quantity is no longer available. Please update it and try again.');
      }
      const requestedWalletAmount = useWallet && walletUsage.trim() ? Math.min(Math.max(0, Number(walletUsage)), walletMaximum) : undefined;
      const orderData = await createBuyNowOrder(flowState.productId, selectedAddress.id, requestedWalletAmount, loyaltyQuote?.acceptedPoints, appliedOffer?.offerId ?? undefined, appliedOffer?.sourceCode, undefined, quantity);
      if (!orderData) {
        setError('No order data returned from server');
        orderCreationPending.current = false;
        return;
      }
      orderCreated = true;

      if (!orderData.id) {
        console.error('Order data received but missing id:', orderData);
        setError('Failed to retrieve order ID from response');
        return;
      }

      if (orderData.paymentRequired === false || orderData.finalPayable === 0) {
        markBuyNowOrderConfirmed(orderData.id, orderData.deliveryAddress);
        writeBuyNowFlowState({ ...readBuyNowFlowState(), addressId: selectedAddress.id, deliveryAddress: orderData.deliveryAddress, orderSubtotal: orderData.subtotal, orderTotal: orderData.totalAmount, offerDiscount: orderData.offerDiscount, loyaltyDiscount: orderData.loyaltyDiscount, loyaltyPointsRedeemed: orderData.loyaltyPointsRedeemed, walletAmount: orderData.walletAmount, finalPayable: orderData.finalPayable, remainingAmount: orderData.remainingAmount, paymentRequired: orderData.paymentRequired });
        navigate('/customer/buynow-success');
        return;
      }

      const navigationState = {
        orderId: orderData.id,
        addressId: selectedAddress.id,
        deliveryAddress: orderData.deliveryAddress,
        orderSubtotal: orderData.subtotal,
        orderTotal: orderData.totalAmount,
        loyaltyDiscount: orderData.loyaltyDiscount,
        offerDiscount: orderData.offerDiscount,
        loyaltyPointsRedeemed: orderData.loyaltyPointsRedeemed,
        walletAmount: orderData.walletAmount,
        finalPayable: orderData.finalPayable,
        remainingAmount: orderData.remainingAmount,
        paymentRequired: orderData.paymentRequired,
      };
      startBuyNowPayment(navigationState);
      
      navigate('/customer/buynow-payment');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order. Please try again.';
      setError(errorMessage);
      console.error('Failed to create buy-now order:', err);
      orderCreationPending.current = orderCreated;
    } finally {
      setLoading(false);
    }
  };

  const applyLoyaltyPoints = async () => {
    setLoyaltyError(null);
    const points = Number(loyaltyPoints);
    const available = loyaltyBalance?.availablePoints ?? 0;
    const maximum = loyaltyBalance?.maximumRedeemablePoints ?? available;
    if (!Number.isInteger(points) || points <= 0) {
      setLoyaltyError('Enter a valid number of points.');
      return;
    }
    if (points > available || points > maximum) {
      setLoyaltyError('Insufficient loyalty points.');
      return;
    }
    if (!loyaltyBalance?.redemptionEnabled) {
      setLoyaltyError('Loyalty point redemption is currently unavailable.');
      return;
    }
    try {
      const quote = await getLoyaltyRedeemQuote({ points, orderAmount: subtotal });
      setLoyaltyQuote(quote);
    } catch {
      setLoyaltyError('Unable to apply loyalty points. Please try again.');
    }
  };

  const removeLoyaltyPoints = () => {
    setLoyaltyQuote(null);
    setLoyaltyPoints('');
    setLoyaltyError(null);
  };

  const availableLoyaltyPoints = loyaltyBalance?.availablePoints ?? 0;
  const pointsToCurrencyConversion = loyaltyBalance?.pointsToCurrencyConversion ?? 0;

  return (
    <SectionShell title="Order summary" subtitle="Review your purchase">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-white/10 px-1 pb-3 sm:px-2">
          {[['Address', true], ['Order Summary', true], ['Payment', false]].map(([label, current], index) => (
            <div key={label as string} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${current ? 'bg-sky-400 text-slate-950' : 'border border-white/20 text-slate-500'}`}>{current ? '✓' : index + 1}</div>
              <span className={`truncate text-xs font-semibold sm:text-sm ${current ? 'text-white' : 'text-slate-500'}`}>{label}</span>
              {index < 2 ? <span className="ml-auto h-px flex-1 bg-white/10" /> : null}
            </div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,7.2fr)_minmax(280px,2.8fr)]">
            <div className="min-w-0 space-y-3">
              <section className="border-b border-white/10 px-1 py-2.5 sm:px-2 sm:py-3">
                <div className="mb-1.5 flex items-center gap-2"><MapPin className="h-4 w-4 text-sky-300" /><h3 className="text-sm font-bold text-white">Delivery address</h3></div>
                <DeliveryAddressSelector compact selectedAddressId={selectedAddress?.id ?? flowState.addressId} onSelect={(address) => { setSelectedAddress(address); setDeliveryAvailable(null); setError(null); }} />
                {selectedAddress ? (
                  !hasVerifiedCoordinates(selectedAddress.latitude, selectedAddress.longitude)
                    ? <p role="alert" className="mt-2 text-xs text-amber-200">This saved address needs a confirmed location. Update it in your address book before continuing.</p>
                    : <DeliveryAvailabilityCheck
                    key={`${flowState.productId}:${selectedAddress.id}:${selectedAddress.postalCode}`}
                    productId={flowState.productId}
                    pincode={selectedAddress.postalCode}
                    onAvailabilityChange={setDeliveryAvailable}
                  />
                ) : null}
              </section>

              <section className="border-b border-white/10 px-1 py-2.5 sm:px-2 sm:py-3">
                <div className="mb-1.5 flex items-center gap-2"><PackageCheck className="h-4 w-4 text-sky-300" /><h3 className="text-sm font-bold text-white">Product details</h3></div>
                <div className="flex min-w-0 gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-slate-950/50">
                    <img src={flowState.productImageUrl || '/logo.png'} alt={flowState.productTitle} className="h-full w-full object-contain p-2" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/logo.png'; }} />
                  </div>
                  <div className="min-w-0 flex-1"><h3 className="break-words text-base font-semibold leading-snug text-white sm:text-lg">{flowState.productTitle}</h3><div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"><span className="text-slate-400">Quantity: {flowState.quantity ?? 1}</span><span className="font-bold text-white">Subtotal: ₹{flowState.productPrice.toLocaleString('en-IN')}</span></div></div>
                </div>
              </section>

              <section className="flex items-start gap-2 rounded-lg border border-white/10 bg-slate-900/50 p-3 text-xs text-slate-400"><Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" /><p>Delivery and applicable charges are handled by the existing order calculation.</p></section>
            </div>

            <aside className="h-fit rounded-lg border border-white/10 bg-slate-900/70 p-3 sm:p-4 lg:sticky lg:top-4">
              <section className="mb-4 rounded-lg border border-amber-400/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2"><Star className="h-4 w-4 text-amber-300" /><h3 className="text-sm font-bold text-white">Use your loyalty points</h3></div>
                {loyaltyLoading ? <p className="mt-3 text-sm text-slate-400">Checking loyalty points...</p> : loyaltyQuote ? <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-3"><p className="text-sm font-semibold text-emerald-200">✓ {loyaltyQuote.acceptedPoints} points applied</p><button type="button" onClick={removeLoyaltyPoints} className="text-xs font-semibold text-slate-300 underline hover:text-white">Remove</button></div> : availableLoyaltyPoints <= 0 ? <p className="mt-3 text-sm text-slate-400">You don't have any loyalty points available.</p> : <><p className="mt-3 text-sm text-slate-300">Available points: <span className="font-semibold text-white">{availableLoyaltyPoints}</span></p><p className="mt-1 text-xs text-slate-400">{pointsToCurrencyConversion} points = ₹1</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input inputMode="numeric" value={loyaltyPoints} onChange={(event) => setLoyaltyPoints(event.target.value.replace(/\D/g, ''))} placeholder="Enter points" className="h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-amber-400/50" /><button type="button" onClick={applyLoyaltyPoints} className="h-10 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-400">Apply Points</button></div><button type="button" onClick={() => { setLoyaltyPoints(String(availableLoyaltyPoints)); }} className="mt-2 text-xs font-semibold text-amber-200 hover:text-amber-100">Use all {availableLoyaltyPoints} points</button></>}
                {loyaltyError ? <p className="mt-2 text-xs text-rose-300">{loyaltyError}</p> : null}
              </section>
              {productContextError ? <p className="rounded-lg border border-rose-400/20 bg-rose-500/10 p-3 text-xs text-rose-200">{productContextError}</p> : <OfferCheckoutSection orderAmount={subtotal} productId={currentProduct?.id} categoryId={currentProduct?.categoryId === undefined ? undefined : Number(currentProduct.categoryId)} categoryName={currentProduct?.categoryName || currentProduct?.category} categoryObject={currentProduct?.categoryObject} onApplied={setAppliedOffer} onRemoved={() => setAppliedOffer(null)} />}
              <section className="mb-4 rounded-lg border border-sky-400/20 bg-sky-500/5 p-3">
                <div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-bold text-white">Wallet Balance</h3><p className="mt-1 text-xs text-slate-400">₹{(walletBalance ?? 0).toLocaleString('en-IN')} available</p></div><WalletCards className="h-4 w-4 text-sky-300" /></div>
                {walletError ? <p className="mt-3 text-sm text-rose-300">{walletError}</p> : walletBalance === null ? <p className="mt-3 text-sm text-slate-400">Checking wallet balance...</p> : walletBalance <= 0 ? <p className="mt-3 text-sm text-slate-400">No wallet balance available.</p> : <><label className="mt-3 flex items-center gap-2 text-sm text-slate-200"><input type="checkbox" checked={useWallet} onChange={(event) => { setUseWallet(event.target.checked); if (!event.target.checked) setWalletUsage(''); }} /> Use wallet balance</label>{useWallet ? <label className="mt-2 block text-xs text-slate-400">Wallet amount to use<input inputMode="decimal" min="0" max={walletMaximum} value={walletUsage} onChange={(event) => { const value = Number(event.target.value.replace(/[^0-9.]/g, '')); setWalletUsage(Number.isFinite(value) ? String(Math.min(Math.max(0, value), walletMaximum)) : ''); }} className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-sky-400/50" /></label> : null}<p className="mt-2 text-xs text-slate-500">Maximum available for this order: ₹{walletMaximum.toLocaleString('en-IN')}</p></>}
              </section>
              <h2 className="text-base font-bold text-white">Price details</h2>
              <div className="mt-3 space-y-2 text-sm"><div className="flex justify-between gap-4 text-slate-400"><span>Subtotal</span><span className="shrink-0 text-white">₹{subtotal.toLocaleString('en-IN')}</span></div><div className="flex justify-between gap-4 text-emerald-300"><span>Loyalty discount</span><span className="shrink-0">-₹{(loyaltyQuote?.discountAmount ?? 0).toLocaleString('en-IN')}</span></div>{appliedOffer ? <div className="flex justify-between gap-4 text-emerald-300"><span>Offer discount</span><span className="shrink-0">-₹{Number(appliedOffer.discountAmount || 0).toLocaleString('en-IN')}</span></div> : null}<div className="flex justify-between gap-4 text-sky-300"><span>Wallet used</span><span className="shrink-0">-₹{(useWallet ? Number(walletUsage) || 0 : 0).toLocaleString('en-IN')}</span></div><div className="border-t border-white/10 pt-2"><div className="flex justify-between gap-4 text-base font-bold"><span className="text-white">Estimated payable</span><span className="shrink-0 text-emerald-300">₹{Math.max(0, (appliedOffer?.finalAmount ?? subtotal) - (loyaltyQuote?.discountAmount ?? 0) - (useWallet ? Number(walletUsage) || 0 : 0)).toLocaleString('en-IN')}</span></div></div></div>
              <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-400"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />Secure payment through Razorpay</div>
            </aside>
          </div>

            {/* Terms */}
            <div className="mt-3 flex items-start gap-2 text-xs text-slate-300">
              <input 
                type="checkbox" 
                id="terms" 
                className="mt-1" 
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  setError(null);
                }}
              />
              <label htmlFor="terms" className="text-sm text-slate-300">
                I agree to the terms and conditions and privacy policy
              </label>
            </div>

            {error && (
              <div className="mt-3 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => navigate('/marketplace')}
                disabled={loading}
                className="inline-flex min-h-[46px] items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-5 py-2 font-medium text-white transition hover:bg-white/5 disabled:opacity-50 sm:min-w-28"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAndPay}
                disabled={loading || !termsAccepted || !selectedAddress || !hasVerifiedCoordinates(selectedAddress.latitude, selectedAddress.longitude) || deliveryAvailable !== true}
                className="inline-flex min-h-[46px] items-center justify-center whitespace-nowrap rounded-full bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-48"
              >
                {loading ? (
                  <>
                    <Loader2 className="inline-block h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="inline-block h-4 w-4 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </button>
            </div>
        </motion.div>
      </div>
    </SectionShell>
  );
}

export function BuyNowPaymentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flowState = readBuyNowFlowState();
  const serverOrderSubtotal = flowState.orderSubtotal ?? flowState.productPrice;
  const serverOrderTotal = flowState.finalPayable ?? flowState.orderTotal ?? flowState.productPrice;
  const serverLoyaltyDiscount = flowState.loyaltyDiscount ?? 0;
  const serverOfferDiscount = flowState.offerDiscount ?? 0;
  const serverWalletAmount = flowState.walletAmount ?? 0;
  const rzpRef = useRef<RazorpayInstance | null>(null);
  const paymentPending = useRef(false);

  console.log('[BUY NOW PAYMENT STATE]', flowState);

  if (!flowState.orderId || flowState.flowStage !== 'PAYMENT') {
    return <Navigate to="/marketplace" replace />;
  }

  const handlePayment = async () => {
    if (!user || !flowState.orderId || paymentPending.current) return;

    paymentPending.current = true;
    setLoading(true);
    setError(null);
    try {
      // Create Razorpay payment session
      const paymentSession = await createRazorpayPayment(flowState.orderId);
      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        throw new Error('Razorpay Checkout could not be loaded.');
      }
      if (!paymentSession.razorpayKeyId || !paymentSession.razorpayOrderId || paymentSession.amount === undefined || paymentSession.currency === undefined) {
        throw new Error('Payment session did not include complete Razorpay checkout details.');
      }

      const options: RazorpayOptions = {
        key: paymentSession.razorpayKeyId,
        order_id: paymentSession.razorpayOrderId,
        amount: paymentSession.amount,
        currency: paymentSession.currency,
        name: 'Bidzo Marketplace',
        description: flowState.productTitle,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            // Verify payment
            await verifyRazorpayPayment(flowState.orderId!, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });

            // Mark as success and move to success page
            markBuyNowInvoiceReady();
            navigate('/customer/buynow-success');
          } catch (err) {
            setError('Payment verification failed. Please contact support.');
            console.error('Verification error:', err);
            paymentPending.current = false;
            setCheckoutOpen(false);
          }
        },
        modal: {
          ondismiss: () => {
            setError('Payment cancelled');
            paymentPending.current = false;
            setCheckoutOpen(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      rzpRef.current = razorpay;
      setCheckoutOpen(true);
      razorpay.open();
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error && err.message === 'Razorpay Checkout could not be loaded.' ? err.message : 'Failed to initiate payment. Please try again.');
      console.error('Payment error:', err);
      paymentPending.current = false;
      setCheckoutOpen(false);
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!flowState.orderId || cancelling) return;
    setCancelling(true);
    setError(null);
    try {
      await cancelOrder(flowState.orderId);
      clearBuyNowFlowState();
      navigate(`/product/${flowState.productId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to cancel this order.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <SectionShell title="Payment" subtitle="Complete your purchase securely">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 sm:p-5"
        >
          <div className="space-y-3">
            {/* Order Summary */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-semibold text-white">Order Summary</h3>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{flowState.productTitle}</span>
                  <span className="text-white">₹{serverOrderSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Quantity</span>
                  <span className="text-white">{flowState.quantity ?? 1}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Loyalty discount</span>
                  <span className="text-emerald-300">-₹{serverLoyaltyDiscount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Offer discount</span>
                  <span className="text-emerald-300">-₹{serverOfferDiscount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Wallet used</span>
                  <span className="text-sky-300">-₹{serverWalletAmount.toLocaleString()}</span>
                </div>
                <div className="border-t border-white/10 pt-2"></div>
                <div className="text-sm text-slate-300">Delivery address: {flowState.deliveryAddress || 'Selected address on order'}</div>
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Total Amount</span>
                  <span className="text-emerald-400">₹{serverOrderTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-semibold text-white">Payment Method</h3>
              <p className="mt-2 text-sm text-slate-400">You will be redirected to Razorpay to complete payment securely.</p>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                onClick={() => void handleCancelOrder()}
                disabled={loading || cancelling}
                className="min-h-[46px] flex-1 rounded-full border border-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/5 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Payment'}
              </button>
              <button
                onClick={handlePayment}
                disabled={loading || checkoutOpen}
                className="min-h-[46px] flex-1 rounded-full bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="inline-block h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="inline-block h-4 w-4 mr-2" />
                    Pay ₹{serverOrderTotal.toLocaleString()}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </SectionShell>
  );
}

export function BuyNowOrderSuccessPage() {
  const navigate = useNavigate();
  const flowState = readBuyNowFlowState();

  if (!flowState.orderId) {
    return <Navigate to="/marketplace" replace />;
  }

  return (
    <SectionShell title="Order Confirmed" subtitle="Your purchase was successful">
      <div className="mx-auto w-full max-w-[960px] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-center shadow-sm sm:p-7"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 sm:h-[68px] sm:w-[68px]">
            <CheckCircle2 className="h-8 w-8 sm:h-9 sm:w-9" />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-white sm:text-[30px]">Order Placed Successfully</h2>
          <p className="mt-1.5 text-sm text-slate-400 sm:text-base">Thank you for your purchase!</p>

          <div className="mx-auto mt-6 grid gap-4 rounded-xl border border-white/10 bg-white/5 p-4 text-left sm:grid-cols-3 sm:gap-5 sm:p-5">
            <div className="min-w-0">
              <p className="text-sm text-slate-400">Order ID</p>
              <p className="mt-1 text-lg font-semibold text-white">#{flowState.orderId}</p>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-400">Product</p>
              <p className="mt-1 break-words text-lg font-semibold text-white">{flowState.productTitle}</p>
              <p className="mt-1 text-sm text-slate-400">Quantity: {flowState.quantity ?? 1}</p>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-400">Order total</p>
              <p className="mt-1 text-lg font-semibold text-emerald-400">₹{(flowState.orderTotal ?? flowState.productPrice).toLocaleString()}</p>
            </div>
          </div>

          <div className="mx-auto mt-5 space-y-2 text-left text-sm text-slate-300 sm:w-fit sm:text-center">
            <p><span className="mr-2 text-emerald-300">✓</span>{flowState.paymentRequired === false || flowState.finalPayable === 0 ? 'No additional payment was required' : 'Payment received and confirmed'}</p>
            <p><span className="mr-2 text-emerald-300">✓</span>Invoice is available to download</p>
            <p><span className="mr-2 text-emerald-300">✓</span>Order is being processed for shipment</p>
          </div>

          <div className="mx-auto mt-6 grid w-full max-w-[680px] gap-3 sm:grid-cols-2">
            <InvoicePdfDownloadButton orderId={flowState.orderId} className="w-full" />
            <button
              onClick={() => {
                clearBuyNowFlowState();
                navigate('/customer/orders');
              }}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            >
              View Orders
            </button>
          </div>

          <button
            onClick={() => {
              clearBuyNowFlowState();
              navigate('/marketplace');
            }}
            className="mx-auto mt-3 inline-flex min-h-12 w-full max-w-[680px] items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    </SectionShell>
  );
}

export function BuyNowInvoicePage() {
  const navigate = useNavigate();
  const flowState = readBuyNowFlowState();
  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [paymentDetails, setPaymentDetails] = useState<PaymentResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!flowState.orderId) return;
      try {
        // Fetch invoice data for the order
        const [orderData, invoiceData] = await Promise.all([
          getOrderById(flowState.orderId),
          getInvoiceByOrderId(flowState.orderId),
        ]);
        const noPaymentRequired = (flowState.paymentRequired === false || flowState.finalPayable === 0) && isConfirmedOrderStatus(orderData.orderStatus);
        const successfulPayment = noPaymentRequired
          ? null
          : (await getPaymentsForOrder(flowState.orderId)).find((payment) => isPaidStatus(payment.status)) ?? null;
        const paymentConfirmed = noPaymentRequired || successfulPayment !== null;
        if (!paymentConfirmed) throw new Error('Payment has not been confirmed for this order yet.');
        setOrder(orderData);
        setInvoice(invoiceData);
        setPaymentDetails(successfulPayment);
        setPaymentStatus(noPaymentRequired ? 'No payment required' : successfulPayment?.status || 'Paid');
      } catch (error) {
        setInvoiceError(error instanceof Error ? error.message : 'Unable to verify this order for invoicing.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [flowState.orderId, flowState.productTitle, flowState.productPrice]);

  if (loading) {
    return (
      <FlowTransitionScreen
        heading="Loading Invoice"
        message="Please wait while we prepare your invoice..."
      />
    );
  }

  if (!invoice || !order) {
    return (
      <SectionShell title="Order invoice" subtitle="Unable to prepare invoice">
        <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          {invoiceError || 'Order details are unavailable.'}
        </p>
      </SectionShell>
    );
  }

  return (
    <SectionShell title="Order Invoice" subtitle={`Order ${order.orderNumber || `#${order.id}`}`}>
      <InvoiceDocument
        order={order}
        invoice={invoice}
        paymentStatus={paymentStatus}
        paymentDetails={paymentDetails ? {
          amount: paymentDetails.amount,
          method: paymentDetails.paymentMethod || paymentDetails.paymentMethodName || paymentDetails.method,
          reference: paymentDetails.paymentRef || paymentDetails.paymentId || paymentDetails.razorpayPaymentId,
          paidAt: paymentDetails.paidAt || paymentDetails.createdAt,
        } : undefined}
        onDownload={() => downloadInvoice(invoice.id)}
      />
      <button
        onClick={() => {
          clearBuyNowFlowState();
          navigate('/marketplace');
        }}
        className="mt-4 min-h-11 rounded-full border border-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/5"
      >
        Back to Marketplace
      </button>
    </SectionShell>
  );
}
