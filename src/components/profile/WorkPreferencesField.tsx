'use client';

import { WORK_PREFERENCES, type WorkPreferenceCode } from '@/lib/constants';

type Props = {
  value: WorkPreferenceCode[];
  onChange: (next: WorkPreferenceCode[]) => void;
  /** When true, render native checkboxes named workPreferences[] for FormData posts */
  formMode?: boolean;
  locale?: string;
  label?: string;
  hint?: string;
};

export function WorkPreferencesField({
  value,
  onChange,
  formMode = false,
  locale = 'en',
  label,
  hint,
}: Props) {
  const isAr = locale === 'ar';
  const title =
    label || (isAr ? 'تفضيل نوع العمل' : 'Work preference');
  const sub =
    hint ||
    (isAr
      ? 'اختر واحداً أو أكثر: دوام كامل، جزئي، أو عن بُعد'
      : 'Choose one or more: full-time, part-time, or remote');

  function toggle(code: WorkPreferenceCode) {
    if (value.includes(code)) onChange(value.filter((c) => c !== code));
    else onChange([...value, code]);
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-white/80">{title}</legend>
      <p className="text-xs text-white/45">{sub}</p>
      <div className="flex flex-wrap gap-2">
        {WORK_PREFERENCES.map((opt) => {
          const checked = value.includes(opt.code);
          return (
            <label
              key={opt.code}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                checked
                  ? 'border-teal-300/45 bg-teal-400/15 text-teal-50'
                  : 'border-white/10 bg-white/[0.03] text-white/65 hover:border-white/20'
              }`}
            >
              <input
                type="checkbox"
                name={formMode ? 'workPreferences' : undefined}
                value={opt.code}
                checked={checked}
                onChange={() => toggle(opt.code)}
                className="h-4 w-4 accent-teal-400"
              />
              <span>{isAr ? opt.ar : opt.en}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
