import { useState, useEffect, useRef } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, CreditCard, Download, Loader2, Printer } from 'lucide-react';
import { SectionShell } from '../../components/SectionShell';
import { useAuth } from '../../context/AuthContext';
import { createRazorpayPayment, verifyRazorpayPayment } from '../../api/paymentApi';
import { createProductImage, createBuyNowOrder } from '../../api/productApi';
import { getOrderById } from '../../api/orderApi';
import { readBuyNowFlowState, writeBuyNowFlowState, initializeBuyNowFlow, startBuyNowPayment, markBuyNowOrderConfirmed, markBuyNowInvoiceReady, clearBuyNowFlowState } from '../../utils/auctionFlowState';
import DeliveryAddressSelector from '../../components/checkout/DeliveryAddressSelector';
import type { AddressResponse } from '../../api/addressApi';

function FlowTransitionScreen({ heading, message, detail }: { heading: string; message: string; detail?: string }) {
  return (
    <SectionShell title={heading} subtitle={message}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35 }}
        className="mx-auto mt-10 flex max-w-3xl flex-col items-center justify-center gap-4 rounded-[24px] border border-white/10 bg-slate-900/70 p-10 text-center text-slate-300"
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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressResponse | null>(null);

  if (!flowState.productId) {
    return <Navigate to="/marketplace" replace />;
  }

  const handleConfirmAndPay = async () => {
    // Validate terms
    if (!termsAccepted) {
      setError('Please accept the terms and conditions to proceed');
      return;
    }
    if (!selectedAddress) {
      setError('Please select a delivery address before continuing to payment.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create order via buy-now endpoint
      const orderData = await createBuyNowOrder(flowState.productId, selectedAddress.id);
      
      if (!orderData) {
        setError('No order data returned from server');
        setLoading(false);
        return;
      }

      if (!orderData.id) {
        console.error('Order data received but missing id:', orderData);
        setError('Failed to retrieve order ID from response');
        setLoading(false);
        return;
      }

      // Update flow state with order ID and move to payment
      markBuyNowOrderConfirmed(orderData.id, orderData.deliveryAddress);
      writeBuyNowFlowState({ ...readBuyNowFlowState(), addressId: selectedAddress.id, deliveryAddress: orderData.deliveryAddress });
      startBuyNowPayment();
      
      navigate('/customer/buynow-payment');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create order. Please try again.';
      setError(errorMessage);
      console.error('Failed to create buy-now order:', err);
      setLoading(false);
    }
  };

  return (
    <SectionShell title="Confirm Order" subtitle={`Review your purchase`}>
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8"
        >
          <div className="space-y-6">
            {/* Product Summary */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-xl font-semibold text-white">{flowState.productTitle}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-emerald-400">₹{flowState.productPrice.toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">Direct purchase - No bidding required</p>
            </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h4 className="font-semibold text-white">Delivery Address</h4>
                <div className="mt-4"><DeliveryAddressSelector selectedAddressId={selectedAddress?.id ?? flowState.addressId} onSelect={setSelectedAddress} /></div>
              </div>

            {/* Buyer Info */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h4 className="font-semibold text-white">Buyer Information</h4>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <p>Name: {user?.name || 'Not provided'}</p>
                <p>Email: {user?.email || 'Not provided'}</p>
                <p>Phone: {user?.phone || 'Not provided'}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white">₹{flowState.productPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Shipping</span>
                <span className="text-white">Calculated at checkout</span>
              </div>
              <div className="border-t border-white/10 pt-2"></div>
              <div className="flex justify-between font-semibold">
                <span className="text-white">Total</span>
                <span className="text-emerald-400">₹{flowState.productPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
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
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/marketplace')}
                disabled={loading}
                className="flex-1 rounded-full border border-white/10 px-4 py-3 font-medium text-white transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAndPay}
                disabled={loading || !termsAccepted}
                className="flex-1 rounded-full bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
  const [error, setError] = useState<string | null>(null);
  const flowState = readBuyNowFlowState();
  const rzpRef = useRef<any>(null);

  if (!flowState.orderId || flowState.flowStage !== 'PAYMENT') {
    return <Navigate to="/marketplace" replace />;
  }

  const handlePayment = async () => {
    if (!user || !flowState.orderId) return;

    setLoading(true);
    try {
      // Create Razorpay payment session
      const paymentSession = await createRazorpayPayment(flowState.orderId);

      const options = {
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
        handler: async (response: any) => {
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
          }
        },
        modal: {
          ondismiss: () => {
            setError('Payment cancelled');
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      setLoading(false);
    } catch (err) {
      setError('Failed to initiate payment. Please try again.');
      console.error('Payment error:', err);
      setLoading(false);
    }
  };

  return (
    <SectionShell title="Payment" subtitle="Complete your purchase securely">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8"
        >
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-semibold text-white">Order Summary</h3>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{flowState.productTitle}</span>
                  <span className="text-white">₹{flowState.productPrice.toLocaleString()}</span>
                </div>
                <div className="border-t border-white/10 pt-2"></div>
                <div className="text-sm text-slate-300">Delivery address: {flowState.deliveryAddress || 'Selected address on order'}</div>
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Total Amount</span>
                  <span className="text-emerald-400">₹{flowState.productPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-semibold text-white">Payment Method</h3>
              <p className="mt-2 text-sm text-slate-400">You will be redirected to Razorpay to complete payment securely.</p>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/marketplace')}
                disabled={loading}
                className="flex-1 rounded-full border border-white/10 px-4 py-3 font-medium text-white transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 rounded-full bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="inline-block h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="inline-block h-4 w-4 mr-2" />
                    Pay ₹{flowState.productPrice.toLocaleString()}
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
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <h2 className="text-3xl font-bold text-white">Order Placed Successfully</h2>
          <p className="mt-2 text-slate-400">Thank you for your purchase!</p>

          <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
            <div>
              <p className="text-sm text-slate-400">Order ID</p>
              <p className="text-lg font-semibold text-white">#{flowState.orderId}</p>
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="text-sm text-slate-400">Product</p>
              <p className="text-lg font-semibold text-white">{flowState.productTitle}</p>
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="text-sm text-slate-400">Amount Paid</p>
              <p className="text-lg font-semibold text-emerald-400">₹{flowState.productPrice.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <p>✓ Payment received and confirmed</p>
            <p>✓ Invoice has been sent to your email</p>
            <p>✓ Order is being processed for shipment</p>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => navigate(`/customer/buynow-invoice`)}
              className="flex-1 rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-3 font-medium text-blue-300 transition hover:bg-blue-500/20"
            >
              <Download className="inline-block h-4 w-4 mr-2" />
              Download Invoice
            </button>
            <button
              onClick={() => {
                clearBuyNowFlowState();
                navigate('/customer/orders');
              }}
              className="flex-1 rounded-full bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              View Orders
            </button>
          </div>

          <button
            onClick={() => {
              clearBuyNowFlowState();
              navigate('/marketplace');
            }}
            className="mt-3 w-full rounded-full border border-white/10 px-4 py-3 font-medium text-white transition hover:bg-white/5"
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
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!flowState.orderId) return;
      try {
        // Fetch invoice data for the order
        const orderData = await getOrderById(flowState.orderId);
        setInvoice({
          ...orderData,
          orderId: flowState.orderId,
          productTitle: flowState.productTitle,
          productPrice: flowState.productPrice,
          orderDate: new Date().toLocaleDateString(),
          status: 'CONFIRMED',
        });
      } catch (error) {
        console.error('Failed to fetch invoice:', error);
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

  if (!invoice) {
    return <Navigate to="/marketplace" replace />;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Placeholder for PDF download logic
    console.log('Downloading invoice...');
  };

  return (
    <SectionShell title="Order Invoice" subtitle={`Order #${invoice.orderId}`}>
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8"
        >
          {/* Invoice Header */}
          <div className="mb-8 border-b border-white/10 pb-8 text-center">
            <h2 className="text-2xl font-bold text-white">INVOICE</h2>
            <p className="mt-2 text-slate-400">Order #{invoice.orderId}</p>
          </div>

          {/* Invoice Details */}
          <div className="mb-8 grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Invoice Date</p>
              <p className="mt-1 font-semibold text-white">{invoice.orderDate}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Status</p>
              <p className="mt-1 font-semibold text-emerald-400">PAID</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 text-left text-xs uppercase text-slate-400">Description</th>
                  <th className="pb-3 text-right text-xs uppercase text-slate-400">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-3 text-white">{invoice.productTitle}</td>
                  <td className="py-3 text-right text-white">₹{invoice.productPrice.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-white">Total</td>
                  <td className="py-3 text-right font-semibold text-emerald-400">₹{invoice.productPrice.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Info */}
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Payment via Razorpay</p>
            <p className="mt-2 font-semibold text-white">Amount Paid: ₹{invoice.productPrice.toLocaleString()}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 rounded-full border border-white/10 px-4 py-3 font-medium text-white transition hover:bg-white/5"
            >
              <Printer className="inline-block h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 rounded-full bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              <Download className="inline-block h-4 w-4 mr-2" />
              Download PDF
            </button>
          </div>

          <button
            onClick={() => {
              clearBuyNowFlowState();
              navigate('/marketplace');
            }}
            className="mt-3 w-full rounded-full border border-white/10 px-4 py-3 font-medium text-white transition hover:bg-white/5"
          >
            Back to Marketplace
          </button>
        </motion.div>
      </div>
    </SectionShell>
  );
}
