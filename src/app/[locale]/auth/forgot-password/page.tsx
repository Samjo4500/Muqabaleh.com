"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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
    setSent(true);
  }

  return (
    <AuthShell title={t("forgotTitle")} subtitle={t("forgotSub")} showBack>
      {!sent ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="forgot-email" className="text-[var(--text-muted)]">
              {t("email")}
            </Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
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
            className="btn-gold w-full cursor-pointer text-sm"
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
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              {t("forgotSent")}
            </h3>
            <p className="text-center text-sm text-[var(--text-muted)]">
              {t("forgotSentSub")}
            </p>
          </div>
          <Link
            href={`/${locale}/auth/signin`}
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold)] hover:text-[var(--gold-hover)] transition-colors"
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
