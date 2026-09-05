import { useEffect, useState } from 'react';
import { Modal } from '../common/Feedback';
import { SecondaryButton } from '../common/Buttons';
import { getAddressById, type AddressResponse } from '../../api/addressApi';

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
  const [resolvedAddress, setResolvedAddress] = useState<AddressResponse | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const objectAddress = address && typeof address !== 'string'
    ? ((address.deliveryAddress ?? address.address ?? address.addressDetails ?? address) as Record<string, unknown>)
    : {};

  useEffect(() => {
    if (!open || !address || typeof address === 'string') return;
    const addressId = Number(objectAddress.id ?? address.id);
    const hasAddressDetails = Boolean(objectAddress.fullName && objectAddress.addressLine1 && objectAddress.city && objectAddress.state && (objectAddress.postalCode || objectAddress.zipCode) && objectAddress.country);
    if (hasAddressDetails || !Number.isFinite(addressId)) {
      setResolvedAddress(null);
      setAddressLoading(false);
      return;
    }

    let active = true;
    setAddressLoading(true);
    getAddressById(addressId).then((loaded) => {
      if (active) {
        setResolvedAddress(loaded);
        setAddressLoading(false);
      }
    }).catch(() => {
      if (active) {
        setResolvedAddress(null);
        setAddressLoading(false);
      }
    });
    return () => { active = false; setAddressLoading(false); };
  }, [address, open]);

  const displayAddress = (resolvedAddress ?? objectAddress) as Record<string, unknown>;
  const hasAddress = Boolean(address && (typeof address === 'string' ? address.trim() : displayAddress.fullName || displayAddress.addressLine1 || displayAddress.city || displayAddress.state || displayAddress.postalCode || displayAddress.country));

  return (
    <>
      <SecondaryButton onClick={() => setOpen(true)}>View Address</SecondaryButton>
      <Modal open={open} title="Delivery Address" onClose={() => setOpen(false)}>
        {addressLoading ? <p className="text-sm text-slate-300">Loading address...</p> : !hasAddress ? <p className="text-sm text-slate-300">Address not available</p> : typeof address === 'string' ? <p className="whitespace-pre-wrap text-sm text-slate-300">{address}</p> : (
          <div className="space-y-3 text-sm text-slate-300">
            <p><span className="text-slate-400">Name</span><br />{field(displayAddress, ['fullName', 'name', 'customerName'])}</p>
            <p><span className="text-slate-400">Phone</span><br />{field(displayAddress, ['phone', 'phoneNumber'])}</p>
            <p><span className="text-slate-400">Address Line 1</span><br />{field(displayAddress, ['addressLine1', 'line1'])}</p>
            <p><span className="text-slate-400">Address Line 2</span><br />{field(displayAddress, ['addressLine2', 'line2'])}</p>
            <p><span className="text-slate-400">City</span><br />{field(displayAddress, ['city'])}</p>
            <p><span className="text-slate-400">State</span><br />{field(displayAddress, ['state'])}</p>
            <p><span className="text-slate-400">Postal Code</span><br />{field(displayAddress, ['postalCode', 'zipCode'])}</p>
            <p><span className="text-slate-400">Country</span><br />{field(displayAddress, ['country'])}</p>
          </div>
        )}
      </Modal>
    </>
  );
}
