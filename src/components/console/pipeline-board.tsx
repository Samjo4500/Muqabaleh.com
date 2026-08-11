'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { scoreColor } from '@/lib/console/defaults';
import { localePath } from '@/i18n/navigation';
import type { ConsolePassport, ConsolePipelineStage } from '@/lib/console/types';

function Card({
  passport,
  href,
  dragging,
}: {
  passport: ConsolePassport;
  href: string;
  dragging?: boolean;
}) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  return (
    <Link
      href={href}
      className={`mq-console-card block p-3 ${dragging ? 'opacity-85 scale-[1.02]' : ''}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] text-[11px] font-normal tracking-wide text-[var(--c-primary)]">
          {passport.candidateName.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium tracking-tight text-[var(--c-text)]">
            {passport.candidateName}
          </p>
          <p className="truncate text-[11px] text-[var(--c-text-3)]">
            {isAr ? passport.roleAr || passport.role : passport.role}
          </p>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-normal tabular-nums"
          style={{ color: scoreColor(passport.score), background: `${scoreColor(passport.score)}18` }}
        >
          {passport.score}
        </span>
      </div>
    </Link>
  );
}

function SortableCard({
  passport,
  href,
}: {
  passport: ConsolePassport;
  href: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: passport.id,
    data: { stageKey: passport.stageKey },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card passport={passport} href={href} dragging={isDragging} />
    </div>
  );
}

function Column({
  stage,
  items,
  tenantSlug,
}: {
  stage: ConsolePipelineStage;
  items: ConsolePassport[];
  tenantSlug: string;
}) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const { setNodeRef } = useDroppable({ id: stage.key });
  return (
    <div
      ref={setNodeRef}
      className="mq-console-surface flex w-[268px] shrink-0 flex-col p-3.5"
    >
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: stage.color || 'var(--c-primary)' }}
          />
          <h3 className="text-[13px] font-medium tracking-tight text-[var(--c-text)]">
            {isAr ? stage.labelAr : stage.labelEn}
          </h3>
        </div>
        <span className="text-[11px] tabular-nums text-[var(--c-text-3)]">{items.length}</span>
      </div>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-[120px] flex-col gap-2">
          {items.map((p) => (
            <SortableCard
              key={p.id}
              passport={p}
              href={localePath(`/console/${tenantSlug}/passports/${p.id}`, locale)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function PipelineBoard({ tenantSlug }: { tenantSlug: string }) {
  const t = useTranslations('console');
  const [stages, setStages] = useState<ConsolePipelineStage[]>([]);
  const [passports, setPassports] = useState<ConsolePassport[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [sRes, pRes] = await Promise.all([
        fetch(`/api/console/${tenantSlug}/stages`),
        fetch(`/api/console/${tenantSlug}/passports`),
      ]);
      const sJson = await sRes.json();
      const pJson = await pRes.json();
      if (cancelled) return;
      setStages(sJson.stages || []);
      setPassports(pJson.passports || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [tenantSlug]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const active = useMemo(
    () => passports.find((p) => p.id === activeId) || null,
    [activeId, passports],
  );

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const onDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    const passportId = String(e.active.id);
    const overId = e.over?.id ? String(e.over.id) : null;
    if (!overId) return;

    let nextStage = overId;
    if (!stages.some((s) => s.key === overId)) {
      const overPassport = passports.find((p) => p.id === overId);
      if (!overPassport) return;
      nextStage = overPassport.stageKey;
    }

    const current = passports.find((p) => p.id === passportId);
    if (!current || current.stageKey === nextStage) return;

    setPassports((prev) =>
      prev.map((p) => (p.id === passportId ? { ...p, stageKey: nextStage } : p)),
    );

    await fetch(`/api/console/${tenantSlug}/pipeline/${passportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stageKey: nextStage }),
    });
  };

  if (loading) {
    return <p className="text-sm text-[var(--c-text-2)]">{t('loading')}</p>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <Column
            key={stage.id}
            stage={stage}
            tenantSlug={tenantSlug}
            items={passports.filter((p) => p.stageKey === stage.key)}
          />
        ))}
      </div>
      <DragOverlay>
        {active ? (
          <Card
            passport={active}
            href="#"
            dragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
