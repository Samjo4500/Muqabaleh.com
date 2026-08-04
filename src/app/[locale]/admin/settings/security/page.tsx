'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline, BiLabel } from '@/components/admin/BiLabel';
import { L } from '@/lib/admin/labels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function SettingsSecurityPage() {
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    fetch('/api/admin/security/2fa')
      .then((r) => r.json())
      .then((d) => setEnabled(Boolean(d.enabled)))
      .catch(() => setEnabled(false));
  }, []);

  const start = async () => {
    const res = await fetch('/api/admin/security/2fa', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || 'Failed');
      return;
    }
    setQr(data.qrDataUrl);
    setSecret(data.secret);
  };

  const verify = async () => {
    const res = await fetch('/api/admin/security/2fa', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: code }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || 'Invalid code');
      return;
    }
    setEnabled(true);
    toast.success(`${L.success.ar} / ${L.success.en}`);
  };

  return (
    <div>
      <AdminPageHeader
        title={{ ar: L.security.ar, en: L.security.en }}
        description={{
          ar: 'تحقق ثنائي، سياسة كلمات المرور، مهلة الجلسة، وحد محاولات الدخول.',
          en: '2FA, password policy, session timeout, and login attempt limiting.',
        }}
      />

      <div className="space-y-6">
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-6">
          <BiLabel ar={L.enable2fa.ar} en={L.enable2fa.en} />
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            <BiInline
              ar={enabled ? 'مفعّل حالياً' : 'غير مفعّل'}
              en={enabled ? 'Currently enabled' : 'Not enabled'}
            />
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={() => void start()}>
              <BiInline ar="إنشاء سر TOTP" en="Generate TOTP secret" />
            </Button>
          </div>
          {qr ? (
            <div className="mt-4 space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="2FA QR" className="h-48 w-48 rounded-lg bg-white p-2" />
              <p className="text-xs text-[var(--text-muted)]">Secret: {secret}</p>
              <div className="flex max-w-sm items-center gap-2">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`${L.verify2fa.ar} / ${L.verify2fa.en}`}
                />
                <Button type="button" onClick={() => void verify()}>
                  <BiInline ar="تأكيد" en="Confirm" />
                </Button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-6 text-sm text-[var(--text-secondary)]">
          <BiLabel ar="سياسة كلمة المرور" en="Password Policy" />
          <ul className="mt-3 list-disc space-y-1 ps-5">
            <li>
              <BiInline ar="١٢ حرفاً على الأقل للمشرفين" en="Min 12 characters for admins" />
            </li>
            <li>
              <BiInline ar="حرف + رقم + رمز خاص" en="Letter + number + special character" />
            </li>
            <li>
              <BiInline ar="انتهاء صلاحية اختياري كل ٩٠ يوماً" en="Optional expiry every 90 days" />
            </li>
          </ul>
          <BiLabel className="mt-6" ar="فرض التحقق الثنائي للمشرفين" en="2FA enforcement for admins" />
          <p className="mt-2">
            <BiInline
              ar="يُنصح بتفعيل TOTP لكل حساب SUPER_ADMIN قبل الوصول الكامل."
              en="TOTP recommended for every SUPER_ADMIN before full access."
            />
          </p>
          <BiLabel className="mt-6" ar="مهلة الجلسة" en="Session Timeout" />
          <p className="mt-2">
            <BiInline ar="ساعتان لمشرف مقابلة الأعلى" en="2 hours for Muqabaleh Super Admin" />
          </p>
          <BiLabel className="mt-6" ar="حد محاولات الدخول" en="Login Attempt Limit" />
          <p className="mt-2">
            <BiInline ar="٥ محاولات فاشلة ثم قفل ١٥ دقيقة" en="5 failed attempts then 15-minute lockout" />
          </p>
          <BiLabel className="mt-6" ar="القائمة البيضاء للـ IP" en="IP whitelist for admin panel" />
          <p className="mt-2">
            <BiInline
              ar="اتركها فارغة للسماح للجميع، أو أضف عناوين مفصولة بفواصل في متغيرات البيئة."
              en="Leave empty to allow all, or set comma-separated IPs via environment variables."
            />
          </p>
          <BiLabel className="mt-6" ar="فرض إعادة تعيين كلمات المرور" en="Force password reset all users" />
          <p className="mt-2">
            <BiInline
              ar="إجراء حساس — يُنفَّذ عبر واجهة الوصول أو API محمي."
              en="Sensitive action — run via Access settings or a protected API."
            />
          </p>
        </section>
      </div>
    </div>
  );
}
