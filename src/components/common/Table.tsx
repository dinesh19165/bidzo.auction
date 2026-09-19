import React from 'react';

interface Column<T> { key: string; label: string; render?: (row: T) => React.ReactNode }

export function Table<T>({ columns, data, className = '' }: { columns: Column<T>[]; data: T[]; className?: string }) {
  const renderCell = (column: Column<T>, row: T) => (column.render ? column.render(row) : (row as any)[column.key]);

  return (
    <div className={`w-full min-w-0 ${className}`}>
      <div className="hidden w-full min-w-0 overflow-x-auto md:block">
        <table className="w-full min-w-0 table-auto text-sm">
          <thead>
            <tr className="border-b border-[var(--border-color)] text-left text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              {columns.map((c) => <th key={c.key} className="px-3 py-2">{c.label}</th>)}
            </tr>
          </thead>
          <tbody className="text-sm text-[var(--text-secondary)]">
            {data.map((row, i) => (
                <tr key={i} className="border-t border-[var(--border-color)] transition hover:bg-[var(--surface-muted)]">
                {columns.map((c) => <td key={c.key} className="px-3 py-3 align-top">{renderCell(c, row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-full space-y-3 md:hidden">
        {data.map((row, i) => (
          <div key={i} className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-4 shadow-sm shadow-[var(--shadow-color)]">
            {columns.map((column) => (
              <div key={column.key} className="flex items-start justify-between gap-3 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{column.label}</span>
                <div className="min-w-0 text-right text-sm text-[var(--text-secondary)]">{renderCell(column, row)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Table;
