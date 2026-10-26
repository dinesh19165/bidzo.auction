import { useState } from 'react';
import { Download, Printer } from 'lucide-react';
import type { OrderResponseDto } from '../../types';
import { downloadInvoiceByOrderId, type InvoiceResponse } from '../../api/invoiceApi';
import { ApiError } from '../../api/apiClient';
import { savePdfBlob } from '../../utils/pdfFile';

type InvoiceAddress = {
  fullName?: string;
  recipientName?: string;
  name?: string;
  phone?: string;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  zipCode?: string;
  country?: string;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
}

function downloadErrorMessage(reason: unknown): string {
  if (reason instanceof ApiError && reason.status === 401) return 'Your session has expired. Sign in again and retry the invoice download.';
  if (reason instanceof ApiError && reason.status === 403) return 'You do not have permission to download this invoice.';
  if (reason instanceof TypeError) return 'Unable to reach the server. Check your connection and try again.';
  if (reason instanceof Error && reason.message.trim().length <= 200
    && !/[\r\n<>]/.test(reason.message)
    && !/(?:stack\s*trace|traceback|password|token|secret|authorization|https?:\/\/)/i.test(reason.message)) {
    return reason.message;
  }
  return 'Unable to download the invoice PDF. Please try again.';
}

export function InvoiceDocument({
  order,
  invoice,
  paymentStatus,
  paymentDetails,
  onDownload,
}: {
  order: OrderResponseDto;
  invoice: InvoiceResponse;
  paymentStatus: string;
  paymentDetails?: { amount?: number; method?: string; reference?: string; paidAt?: string };
  onDownload: () => Promise<{ blob: Blob; filename: string }>;
}) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const address = order.deliveryAddress && typeof order.deliveryAddress === 'object'
    ? order.deliveryAddress as InvoiceAddress
    : null;
  const items = order.items ?? [];
  const shipping = Number(invoice.shippingAmount ?? invoice.shippingCharges ?? 0);
  const subtotal = items.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);

  const download = async () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadError('');
    try {
      const file = await onDownload();
      savePdfBlob(file.blob, file.filename);
    } catch (reason) {
      setDownloadError(downloadErrorMessage(reason));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <article className="invoice-print-area rounded-2xl border border-slate-200 bg-white p-5 text-slate-800 shadow-sm sm:p-9" aria-label="Invoice document">
        <header className="flex flex-wrap items-start justify-between gap-5 border-b-2 border-emerald-700 pb-6">
          <div>
            <p className="text-2xl font-bold tracking-tight text-emerald-800">BIDZO</p>
            <p className="mt-1 text-sm text-slate-500">Marketplace</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-semibold tracking-wide text-slate-900">INVOICE</h2>
            <p className="mt-2 text-sm">Invoice no. <strong>{invoice.invoiceNumber || `INV-${invoice.id}`}</strong></p>
            <p className="text-sm">Date: {invoice.invoiceDate || 'Not provided'}</p>
            <p className="text-sm">Order: {order.orderNumber || `#${order.id}`} (ID {order.id})</p>
          </div>
        </header>

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bill to / delivery address</h3>
            {address ? <div className="mt-2 space-y-0.5 text-sm">
              <p className="font-semibold">{address.fullName || address.recipientName || address.name || 'Recipient unavailable'}</p>
              {address.addressLine1 ? <p>{address.addressLine1}</p> : null}
              {address.addressLine2 ? <p>{address.addressLine2}</p> : null}
              <p>{[address.city, address.state].filter(Boolean).join(', ') || 'City and state unavailable'}</p>
              <p>{[address.postalCode || address.zipCode, address.country].filter(Boolean).join(' ') || 'PIN code and country unavailable'}</p>
              {address.phone || address.phoneNumber ? <p>Phone: {address.phone || address.phoneNumber}</p> : null}
            </div> : <p className="mt-2 whitespace-pre-wrap text-sm">{typeof order.deliveryAddress === 'string' ? order.deliveryAddress : 'Address unavailable'}</p>}
          </div>
          <div className="sm:text-right">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Payment</h3>
            <p className="mt-2 text-sm">Status: <strong>{paymentStatus}</strong></p>
            {paymentDetails?.amount !== undefined ? <p className="mt-1 text-sm">Amount paid: {formatCurrency(paymentDetails.amount)}</p> : null}
            {paymentDetails?.method ? <p className="mt-1 text-sm">Method: {paymentDetails.method}</p> : null}
            {paymentDetails?.reference ? <p className="mt-1 break-all text-sm">Reference: {paymentDetails.reference}</p> : null}
            {paymentDetails?.paidAt ? <p className="mt-1 text-sm">Paid on: {paymentDetails.paidAt}</p> : null}
          </div>
        </section>

        <div className="mt-7 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-y border-slate-300 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-3 pr-3">Product</th>
                <th className="py-3 px-2 text-center">Qty</th>
                <th className="py-3 px-2 text-right">Unit price</th>
                <th className="py-3 pl-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const quantity = Number(item.quantity || 0);
                const unitPrice = Number(item.price || 0);
                return <tr key={item.id ?? `${item.productId}-${index}`} className="border-b border-slate-200 align-top break-inside-avoid">
                  <td className="py-3 pr-3 font-medium">{item.productName || item.name || `Product #${item.productId ?? 'N/A'}`}</td>
                  <td className="py-3 px-2 text-center">{quantity}</td>
                  <td className="py-3 px-2 text-right">{formatCurrency(unitPrice)}</td>
                  <td className="py-3 pl-3 text-right">{formatCurrency(unitPrice * quantity)}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>

        <section className="ml-auto mt-5 w-full max-w-sm space-y-2 text-sm">
          <div className="flex justify-between gap-4"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          {invoice.discountAmount > 0 ? <div className="flex justify-between gap-4"><span>Discount</span><span>-{formatCurrency(invoice.discountAmount)}</span></div> : null}
          {invoice.taxAmount > 0 ? <div className="flex justify-between gap-4"><span>Tax</span><span>{formatCurrency(invoice.taxAmount)}</span></div> : null}
          {shipping > 0 ? <div className="flex justify-between gap-4"><span>Shipping</span><span>{formatCurrency(shipping)}</span></div> : null}
          <div className="flex justify-between gap-4 border-t-2 border-slate-800 pt-3 text-base font-bold"><span>Total</span><span>{formatCurrency(Number(invoice.totalAmount))}</span></div>
        </section>
        <footer className="mt-8 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">Thank you for shopping with Bidzo.</footer>
      </article>

      <div className="invoice-actions mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-white/5"><Printer className="h-4 w-4" />Print Invoice</button>
        <button type="button" onClick={() => { void download(); }} disabled={downloading} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-4 w-4" />{downloading ? 'Downloading…' : 'Download Invoice PDF'}</button>
      </div>
      {downloadError ? <p role="alert" className="mt-3 rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{downloadError}</p> : null}
    </div>
  );
}

export function InvoicePdfDownloadButton({
  orderId,
  label = 'Download Invoice',
  className = '',
}: {
  orderId: number;
  label?: string;
  className?: string;
}) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const download = async () => {
    if (downloading) return;
    setDownloading(true);
    setError('');
    try {
      const file = await downloadInvoiceByOrderId(orderId);
      savePdfBlob(file.blob, file.filename);
    } catch (reason) {
      setError(downloadErrorMessage(reason));
    } finally {
      setDownloading(false);
    }
  };

  return <div className={className}>
    <button type="button" onClick={() => { void download(); }} disabled={downloading} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50">
      <Download className="h-4 w-4" />{downloading ? 'Downloading invoice…' : label}
    </button>
    {error ? <p role="alert" className="mt-2 rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-left text-sm text-rose-200">{error}</p> : null}
  </div>;
}
