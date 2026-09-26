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
    <footer className="mobile-footer border-t border-[var(--border-color)] bg-[var(--surface-elevated)]">
      <div className="footer-grid mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div>
          <p className="text-lg font-semibold text-[var(--text-primary)]">{platformName}</p>
          <p className="mt-3 text-sm text-[var(--text-muted)]">A premium marketplace for real products, live auctions, verified sellers, and fast delivery across India.</p>
          {(supportEmail || address) && <p className="mt-3 text-sm text-[var(--text-muted)]">{supportEmail}{supportEmail && address ? ' · ' : ''}{address}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-[var(--text-muted)]">
            <span>© 2026 {platformName}</span>
            <span>All rights reserved</span>
          </div>
        </div>
       
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Support</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
            <li><Link to="/help" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Help Center</Link></li>
            <li><Link to="/faq" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">FAQ</Link></li>
            <li><Link to="/contact" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Contact us</Link></li>
            <li><Link to="/refund" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Refund policy</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
            <li><Link to="/about" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">About us</Link></li>
            <li><Link to="/privacy" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Privacy</Link></li>
            <li><Link to="/terms" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Terms & Condations</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Stay connected</p>
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