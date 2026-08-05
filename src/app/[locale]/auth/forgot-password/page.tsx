"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";

import { AuthShell } from "@/components/brand";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);

  const emailError =
    touched && !email
      ? t("errorEmailRequired")
      : touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? t("errorEmailInvalid")
        : "";

  const isRTL = locale === "ar";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (emailError || !email) return;
    // Email delivery is not wired yet — show honest unavailable state.
    setSent(true);
  }

  return (
    <AuthShell title={t("forgotTitle")} subtitle={t("forgotSub")} showBack>
      <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-300">
        {locale === "ar"
          ? "إعادة التعيين عبر البريد غير مفعّلة بعد. تواصل مع مشرف المنصة لإعادة تعيين كلمة المرور."
          : "Email password reset is not connected yet. Contact the platform admin to reset your password."}
      </div>
      {!sent ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="forgot-email" className="text-white/60">
              {t("email")}
            </Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-white/40"
                size={18}
                strokeWidth={1.75}
              />
              <Input
                id="forgot-email"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
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

          {/* Submit */}
          <button
            type="submit"
            className="mq-btn mq-btn-primary flex w-full min-h-[48px] cursor-pointer items-center justify-center text-sm"
          >
            {tCommon("submit")}
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
            <Mail className="text-emerald-500" size={28} strokeWidth={1.75} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-lg font-bold text-white">
              {t("forgotSent")}
            </h3>
            <p className="text-center text-sm text-white/60">
              {t("forgotSentSub")}
            </p>
          </div>
          <Link
            href={`/${locale}/auth/signin`}
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-teal-300 hover:text-teal-200 transition-colors"
          >
            {isRTL ? (
              <ArrowRight size={16} strokeWidth={1.75} />
            ) : (
              <ArrowLeft size={16} strokeWidth={1.75} />
            )}
            {t("backToSignin")}
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
