import React from 'react';

interface Column<T> { key: string; label: string; render?: (row: T) => React.ReactNode }

export function Table<T>({ columns, data, className = '' }: { columns: Column<T>[]; data: T[]; className?: string }) {
  const renderCell = (column: Column<T>, row: T) => (column.render ? column.render(row) : (row as any)[column.key]);

  return (
    <div className={`w-full min-w-0 ${className}`}>
      <div className="hidden w-full min-w-0 overflow-x-auto md:block">
        <table className="w-full min-w-0 table-auto text-sm">
          <thead>
            <tr className="text-left text-slate-400">
              {columns.map((c) => <th key={c.key} className="px-3 py-2">{c.label}</th>)}
            </tr>
          </thead>
          <tbody className="text-slate-300">
            {data.map((row, i) => (
              <tr key={i} className="border-t border-white/10">
                {columns.map((c) => <td key={c.key} className="px-3 py-3 align-top">{renderCell(c, row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-full space-y-3 md:hidden">
        {data.map((row, i) => (
          <div key={i} className="w-full rounded-[24px] border border-white/10 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/20">
            {columns.map((column) => (
              <div key={column.key} className="flex items-start justify-between gap-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{column.label}</span>
                <div className="text-sm text-slate-200">{renderCell(column, row)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Table;
