'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function getPasswordStrength(pw: string): 'weak' | 'medium' | 'strong' {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return 'weak';
  if (score <= 2) return 'medium';
  return 'strong';
}

export function PasswordStrengthMeter({
  password,
  label,
  weakLabel,
  mediumLabel,
  strongLabel,
}: {
  password: string;
  label: string;
  weakLabel: string;
  mediumLabel: string;
  strongLabel: string;
}) {
  if (!password) return null;
  const strength = getPasswordStrength(password);
  const text =
    strength === 'strong' ? strongLabel : strength === 'medium' ? mediumLabel : weakLabel;
  const color =
    strength === 'strong'
      ? 'bg-emerald-500'
      : strength === 'medium'
        ? 'bg-amber-500'
        : 'bg-red-500';
  const textColor =
    strength === 'strong'
      ? 'text-emerald-400'
      : strength === 'medium'
        ? 'text-amber-400'
        : 'text-red-400';
  const width = strength === 'strong' ? '100%' : strength === 'medium' ? '66%' : '33%';

  return (
    <div className="flex flex-col gap-1.5 pt-0.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-white/55">{label}</span>
        <span className={cn('text-xs font-semibold', textColor)}>{text}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className={cn('h-full rounded-full transition-all duration-300', color)} style={{ width }} />
      </div>
    </div>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  showLabel?: string;
  hideLabel?: string;
  className?: string;
};

export function PasswordField({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete = 'current-password',
  error,
  showLabel = 'Show password',
  hideLabel = 'Hide password',
  className,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={id} className="text-white/60">
        {label}
      </Label>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-white/40"
          size={18}
          strokeWidth={1.75}
        />
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={!!error}
          className={cn(
            'glass-input h-11 ps-10 pe-11 text-white placeholder:text-white/35',
            error && '!border-red-500 focus-visible:!border-red-500',
          )}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute end-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-white/55 transition hover:bg-white/10 hover:text-white"
          aria-label={visible ? hideLabel : showLabel}
          tabIndex={0}
        >
          {visible ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
        </button>
      </div>
      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
