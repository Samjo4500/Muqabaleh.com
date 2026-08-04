'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline, BiLabel } from '@/components/admin/BiLabel';
import { L, type Bi } from '@/lib/admin/labels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type Column = { key: string; label: Bi };

export function AdminResourceClient({
  title,
  description,
  resource,
  columns,
  creatable = true,
  emptyHint,
}: {
  title: Bi;
  description?: Bi;
  resource: string;
  columns: Column[];
  creatable?: boolean;
  emptyHint?: Bi;
}) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/resources?resource=${encodeURIComponent(resource)}&q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setRows(Array.isArray(data.items) ? data.items : []);
    } catch {
      setError(L.error.en);
    } finally {
      setLoading(false);
    }
  }, [resource, q]);

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

  return (
    <div>
      <AdminPageHeader
        title={title}
        description={description}
        actions={
          <>
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

      <div className="mb-4">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`${L.search.ar} / ${L.search.en}`}
          className="max-w-md"
        />
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
                <TableCell colSpan={columns.length + 1} className="py-10 text-center text-[var(--text-muted)]">
                  <BiInline
                    ar={emptyHint?.ar ?? L.empty.ar}
                    en={emptyHint?.en ?? L.empty.en}
                  />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={String(row.id)}>
                  {columns.map((c) => {
                    const val = row[c.key];
                    return (
                      <TableCell key={c.key} className="max-w-[240px] truncate text-sm">
                        {c.key === 'status' || c.key === 'isActive' ? (
                          <Badge variant="outline">{String(val)}</Badge>
                        ) : typeof val === 'object' && val !== null ? (
                          JSON.stringify(val).slice(0, 80)
                        ) : (
                          String(val ?? '—')
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-400"
                      onClick={() => void onDelete(String(row.id))}
                    >
                      <BiInline ar={L.delete.ar} en={L.delete.en} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
