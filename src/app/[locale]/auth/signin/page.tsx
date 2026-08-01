"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Mail, Lock, Loader2, AlertTriangle, Zap } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

import { AuthShell } from "@/components/brand";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SignInPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [demoMode, setDemoMode] = useState(false);
  const [dbAvailable, setDbAvailable] = useState(true);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        setDemoMode(data.demoMode === true);
        setDbAvailable(data.services?.database === true);
      })
      .catch(() => {});
  }, []);

  const emailError =
    touched.email && !email
      ? t("errorEmailRequired")
      : touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? t("errorEmailInvalid")
        : "";

  const passwordError = touched.password && !password ? t("errorPasswordRequired") : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (emailError || passwordError || !email || !password) return;

    // Demo mode: accept any credentials and redirect to app
    if (demoMode || !dbAvailable) {
      router.push(`/${locale}/app`);
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(t("loginFailed") || "البريد أو كلمة المرور غير صحيحة");
      } else {
        router.push(`/${locale}/app`);
        router.refresh();
      }
    } catch {
      toast.error(t("loginFailed") || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title={t("signinTitle")} showBack>
      {/* Service status banner */}
      {!dbAvailable && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2.5 text-xs text-amber-400">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            {locale === 'ar'
              ? 'قاعدة البيانات غير متصلة. أدخل أي بريد وكلمة مرور للدخول كوضع عرض.'
              : 'Database not connected. Enter any email & password to browse as demo.'}
          </span>
        </div>
      )}
      {demoMode && dbAvailable && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2.5 text-xs text-amber-400">
          <Zap size={14} className="mt-0.5 shrink-0" />
          <span>
            {locale === 'ar'
              ? 'وضع العرض التوضيحي — أدخل أي بريد وكلمة مرور للدخول.'
              : 'Demo mode — enter any email & password to sign in.'}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* Email */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="signin-email" className="text-[var(--text-muted)]">
            {t("email")}
          </Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
              size={18}
              strokeWidth={1.75}
            />
            <Input
              id="signin-email"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, email: true }))}
              aria-invalid={!!emailError}
              className={
                "glass-input ps-10 h-11" + (emailError ? " !border-red-500 focus-visible:!border-red-500" : "")
              }
              autoComplete="email"
            />
          </div>
          {emailError && (
            <p className="text-xs text-red-400" role="alert">
              {emailError}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="signin-password" className="text-[var(--text-muted)]">
            {t("password")}
          </Label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
              size={18}
              strokeWidth={1.75}
            />
            <Input
              id="signin-password"
              type="password"
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, password: true }))}
              aria-invalid={!!passwordError}
              className={
                "glass-input ps-10 h-11" + (passwordError ? " !border-red-500 focus-visible:!border-red-500" : "")
              }
              autoComplete="current-password"
            />
          </div>
          {passwordError && (
            <p className="text-xs text-red-400" role="alert">
              {passwordError}
            </p>
          )}
        </div>

        {/* Forgot password — aligned end */}
        <div className="flex justify-end">
          <Link
            href={`/${locale}/auth/forgot-password`}
            className="text-sm text-[var(--gold)] hover:text-[var(--gold-hover)] transition-colors"
          >
            {t("forgotLink")}
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-gold flex w-full cursor-pointer items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : null}
          {t("login")}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-[var(--text-faint)]">{t("or")}</span>
          <Separator className="flex-1" />
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-[var(--text-muted)]">
            {t("noAccount")}{" "}
          <Link
            href={`/${locale}/auth/register`}
            className="font-semibold text-[var(--gold)] hover:text-[var(--gold-hover)] transition-colors"
          >
            {t("createAccount")}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
