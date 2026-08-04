import { ShieldCheck, TrendingUp } from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import { adminStats, chartSeries } from '../data/mockData';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export function AdminDashboardPage() {
  return (
    <SectionShell title="Admin dashboard" subtitle="Operations, trust and financial oversight">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((item) => (
          <div key={item.label} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20">
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
          <h3 className="text-lg font-semibold text-white">Revenue trend</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartSeries}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
          <h3 className="text-lg font-semibold text-white">Operational health</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><div className="flex items-center gap-2 text-emerald-300"><ShieldCheck className="h-4 w-4" /> 94% policy compliance</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><div className="flex items-center gap-2 text-amber-300"><TrendingUp className="h-4 w-4" /> 18% increase in processed orders</div></div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
