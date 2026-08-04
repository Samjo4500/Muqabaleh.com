'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Plus, RefreshCw } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline, BiLabel } from '@/components/admin/BiLabel';
import { L, type Bi } from '@/lib/admin/labels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type AdminColumn = {
  key: string;
  label: Bi;
  render?: (row: Record<string, unknown>) => React.ReactNode;
};

function flatten(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'object') {
    if ('email' in (value as object)) return String((value as { email?: string }).email ?? '');
    return JSON.stringify(value);
  }
  return String(value);
}

function toCsv(rows: Record<string, unknown>[], columns: AdminColumn[]) {
  const header = columns.map((c) => c.label.en).join(',');
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const raw = flatten(row[c.key]);
        return `"${raw.replace(/"/g, '""')}"`;
      })
      .join(','),
  );
  return [header, ...lines].join('\n');
}

export function AdminDataTable({
  title,
  description,
  resource,
  columns,
  creatable = true,
  selectable = false,
  bulkActions,
  rowActions,
  emptyHint,
  demoRows,
}: {
  title: Bi;
  description?: Bi;
  resource: string;
  columns: AdminColumn[];
  creatable?: boolean;
  selectable?: boolean;
  bulkActions?: { id: string; label: Bi; onRun: (ids: string[]) => Promise<void> }[];
  rowActions?: { id: string; label: Bi; onRun: (row: Record<string, unknown>) => Promise<void> }[];
  emptyHint?: Bi;
  /** Shown when API returns empty — keeps UI reviewable */
  demoRows?: Record<string, unknown>[];
}) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [usingDemo, setUsingDemo] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `/api/admin/resources?resource=${encodeURIComponent(resource)}&q=${encodeURIComponent(q)}`,
      );
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      const items = Array.isArray(data.items) ? data.items : [];
      if (items.length === 0 && demoRows?.length) {
        setRows(demoRows);
        setUsingDemo(true);
      } else {
        setRows(items);
        setUsingDemo(false);
      }
    } catch {
      if (demoRows?.length) {
        setRows(demoRows);
        setUsingDemo(true);
      } else {
        setError(L.error.en);
      }
    } finally {
      setLoading(false);
    }
  }, [resource, q, demoRows]);

  useEffect(() => {
    void load();
  }, [load]);

  const onCreate = async () => {
    const res = await fetch(`/api/admin/resources?resource=${encodeURIComponent(resource)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.ok) void load();
  };

  const onDelete = async (id: string) => {
    if (!confirm(`${L.delete.ar} / ${L.delete.en}?`)) return;
    const res = await fetch(
      `/api/admin/resources?resource=${encodeURIComponent(resource)}&id=${encodeURIComponent(id)}`,
      { method: 'DELETE' },
    );
    if (res.ok) void load();
  };

  const exportCsv = () => {
    const csv = toCsv(rows, columns);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resource}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allSelected = useMemo(
    () => rows.length > 0 && rows.every((r) => selected.has(String(r.id))),
    [rows, selected],
  );

  return (
    <div>
      <AdminPageHeader
        title={title}
        description={description}
        actions={
          <>
            <Button type="button" variant="outline" size="sm" onClick={exportCsv} className="gap-2">
              <Download size={14} />
              <BiInline ar={L.exportCsv.ar} en={L.exportCsv.en} />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => void load()} className="gap-2">
              <RefreshCw size={14} />
              <BiInline ar={L.refresh.ar} en={L.refresh.en} />
            </Button>
            {creatable ? (
              <Button type="button" size="sm" onClick={() => void onCreate()} className="gap-2">
                <Plus size={14} />
                <BiInline ar={L.create.ar} en={L.create.en} />
              </Button>
            ) : null}
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`${L.search.ar} / ${L.search.en}`}
          className="max-w-md"
        />
        {usingDemo ? (
          <Badge variant="outline" className="text-amber-300">
            <BiInline ar="بيانات توضيحية" en="Demo data" />
          </Badge>
        ) : null}
        {selectable && selected.size > 0 && bulkActions?.length ? (
          <div className="flex flex-wrap gap-2">
            {bulkActions.map((a) => (
              <Button
                key={a.id}
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => void a.onRun(Array.from(selected)).then(() => load())}
              >
                <BiInline ar={a.label.ar} en={a.label.en} />
              </Button>
            ))}
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="mb-4 text-sm text-red-400">
          <BiInline ar={L.error.ar} en={L.error.en} />
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--bg-panel)]">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable ? (
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => {
                      if (e.target.checked) setSelected(new Set(rows.map((r) => String(r.id))));
                      else setSelected(new Set());
                    }}
                  />
                </TableHead>
              ) : null}
              {columns.map((c) => (
                <TableHead key={c.key}>
                  <BiLabel ar={c.label.ar} en={c.label.en} size="sm" />
                </TableHead>
              ))}
              <TableHead>
                <BiLabel ar={L.actions.ar} en={L.actions.en} size="sm" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((c) => (
                    <TableCell key={c.key}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 2 : 1)}
                  className="py-10 text-center text-[var(--text-muted)]"
                >
                  <BiInline ar={emptyHint?.ar ?? L.empty.ar} en={emptyHint?.en ?? L.empty.en} />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const id = String(row.id ?? '');
                return (
                  <TableRow key={id || JSON.stringify(row)}>
                    {selectable ? (
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selected.has(id)}
                          onChange={(e) => {
                            setSelected((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(id);
                              else next.delete(id);
                              return next;
                            });
                          }}
                        />
                      </TableCell>
                    ) : null}
                    {columns.map((c) => (
                      <TableCell key={c.key} className="max-w-[240px] truncate text-sm">
                        {c.render ? c.render(row) : flatten(row[c.key])}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {rowActions?.map((a) => (
                          <Button
                            key={a.id}
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => void a.onRun(row)}
                          >
                            <BiInline ar={a.label.ar} en={a.label.en} />
                          </Button>
                        ))}
                        {!usingDemo && id ? (
                          <Button type="button" size="sm" variant="ghost" onClick={() => void onDelete(id)}>
                            <BiInline ar={L.delete.ar} en={L.delete.en} />
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
