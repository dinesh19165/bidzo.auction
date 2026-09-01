import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson } from '../api/apiClient';

interface GeneralSettings {
  platformName?: unknown;
  supportEmail?: unknown;
  address?: unknown;
}

interface GeneralSettingsResponse {
  data?: GeneralSettings;
  content?: GeneralSettings;
}

export function Footer() {
  const [platformName, setPlatformName] = useState('Bidzo');
  const [supportEmail, setSupportEmail] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    fetchJson<GeneralSettings | GeneralSettingsResponse>('/api/admin/settings/getgeneral', { method: 'GET' }, false)
      .then((response) => {
        const settings = 'data' in response || 'content' in response
          ? response.data ?? response.content
          : response;
        const generalSettings = (settings || {}) as GeneralSettings;
        if (typeof generalSettings.platformName === 'string' && generalSettings.platformName.trim()) setPlatformName(generalSettings.platformName);
        if (typeof generalSettings.supportEmail === 'string') setSupportEmail(generalSettings.supportEmail);
        if (typeof generalSettings.address === 'string') setAddress(generalSettings.address);
      })
      .catch(() => undefined);
  }, []);

  return (
    <footer className="border-t border-white/10 bg-slate-950/90">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div>
          <p className="text-lg font-semibold">{platformName}</p>
          <p className="mt-3 text-sm text-slate-400">A premium marketplace for real products, live auctions, verified sellers, and fast delivery across India.</p>
          {(supportEmail || address) && <p className="mt-3 text-sm text-slate-400">{supportEmail}{supportEmail && address ? ' · ' : ''}{address}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-slate-400">
            <span>© 2026 {platformName}</span>
            <span>All rights reserved</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Marketplace</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link to="/marketplace" className="hover:text-white">Marketplace</Link></li>
            <li><Link to="/auctions" className="hover:text-white">Auctions</Link></li>
            <li><Link to="/wishlist" className="hover:text-white">Wishlist</Link></li>
            <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Support</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
            <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact us</Link></li>
            <li><Link to="/refund" className="hover:text-white">Refund policy</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link to="/about" className="hover:text-white">About us</Link></li>
            <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
            <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-white">Terms</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Stay connected</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Twitter</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">LinkedIn</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Instagram</span>
          </div>
        </div>
      </div>
    </footer>
  );
}