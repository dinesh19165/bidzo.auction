import { useState } from 'react';
import { Modal } from '../common/Feedback';
import { SecondaryButton } from '../common/Buttons';

type DeliveryAddress = Record<string, unknown> | string | null | undefined;

type Props = {
  address: DeliveryAddress;
};

function field(address: Record<string, unknown>, keys: string[]) {
  const value = keys.map((key) => address[key]).find((item) => item !== undefined && item !== null && item !== '');
  return value === undefined ? '-' : String(value);
}

export default function DeliveryAddressViewer({ address }: Props) {
  const [open, setOpen] = useState(false);
  const hasAddress = Boolean(address && (typeof address === 'string' ? address.trim() : Object.keys(address).length > 0));
  const objectAddress = address && typeof address !== 'string' ? address : {};

  return (
    <>
      <SecondaryButton onClick={() => setOpen(true)}>View Address</SecondaryButton>
      <Modal open={open} title="Delivery Address" onClose={() => setOpen(false)}>
        {!hasAddress ? <p className="text-sm text-slate-300">Address not available</p> : typeof address === 'string' ? <p className="whitespace-pre-wrap text-sm text-slate-300">{address}</p> : (
          <div className="space-y-3 text-sm text-slate-300">
            <p><span className="text-slate-400">Name</span><br />{field(objectAddress, ['fullName', 'name', 'customerName'])}</p>
            <p><span className="text-slate-400">Phone</span><br />{field(objectAddress, ['phone'])}</p>
            <p><span className="text-slate-400">Address Line 1</span><br />{field(objectAddress, ['addressLine1', 'line1'])}</p>
            <p><span className="text-slate-400">Address Line 2</span><br />{field(objectAddress, ['addressLine2', 'line2'])}</p>
            <p><span className="text-slate-400">City</span><br />{field(objectAddress, ['city'])}</p>
            <p><span className="text-slate-400">State</span><br />{field(objectAddress, ['state'])}</p>
            <p><span className="text-slate-400">Postal Code</span><br />{field(objectAddress, ['postalCode'])}</p>
            <p><span className="text-slate-400">Country</span><br />{field(objectAddress, ['country'])}</p>
          </div>
        )}
      </Modal>
    </>
  );
}
