import { SectionShell } from '../components/SectionShell';

export function DeliveryPage() {
  return (
    <SectionShell title="Delivery" subtitle="Track your shipment">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8">
          <p className="text-sm text-blue-300">Tracking number: BZ-879221</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">On the way to your address</h3>
          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <p>• Packed and scanned at warehouse</p>
            <p>• Transit to Bengaluru hub</p>
            <p>• Out for delivery</p>
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8">
          <h4 className="text-lg font-semibold text-white">Courier details</h4>
          <p className="mt-3 text-sm text-slate-300">Courier: RapidShip</p>
          <p className="mt-2 text-sm text-slate-300">ETA: 2 hours</p>
          <p className="mt-2 text-sm text-slate-300">Status: Delivered to local hub</p>
        </div>
      </div>
    </SectionShell>
  );
}
