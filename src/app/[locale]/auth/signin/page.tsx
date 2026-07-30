"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";

import { AuthShell } from "@/components/brand";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SignInPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });

  const emailError =
    touched.email && !email
      ? t("errorEmailRequired")
      : touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? t("errorEmailInvalid")
        : "";

  const passwordError = touched.password && !password ? t("errorPasswordRequired") : "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (emailError || passwordError || !email || !password) return;
    toast.info(t("comingSoon"));
  }

  return (
    <AuthShell title={t("signinTitle")}>
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
          className="btn-gold w-full cursor-pointer text-sm"
        >
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
