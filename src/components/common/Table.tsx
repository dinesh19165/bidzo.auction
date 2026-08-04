import React from 'react';

interface Column<T> { key: string; label: string; render?: (row: T) => React.ReactNode }

export function Table<T>({ columns, data, className = '' }: { columns: Column<T>[]; data: T[]; className?: string }) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full table-auto text-sm">
        <thead>
          <tr className="text-left text-slate-400">
            {columns.map((c) => <th key={c.key} className="px-3 py-2">{c.label}</th>)}
          </tr>
        </thead>
        <tbody className="text-slate-300">
          {data.map((row, i) => (
            <tr key={i} className="border-t border-white/6">
              {columns.map((c) => <td key={c.key} className="px-3 py-3 align-top">{c.render ? c.render(row) : (row as any)[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
