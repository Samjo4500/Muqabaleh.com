"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Mail, Lock, User, Building2, Globe, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { AuthShell } from "@/components/brand";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getPasswordStrength(pw: string): "weak" | "medium" | "strong" {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return "weak";
  if (score <= 2) return "medium";
  return "strong";
}

function StrengthBar({ strength, label }: { strength: string; label: string }) {
  const colorMap: Record<string, string> = {
    weak: "bg-red-500",
    medium: "bg-amber-500",
    strong: "bg-emerald-500",
  };
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-faint)]">{label}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorMap[strength] ?? "bg-white/10"}`}
          style={{ width: strength === "strong" ? "100%" : strength === "medium" ? "60%" : "30%" }}
        />
      </div>
    </div>
  );
}

type FieldErrors = Record<string, string>;

export default function RegisterPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  // Shared fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState("");

  // Company fields
  const [companyName, setCompanyName] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [companySector, setCompanySector] = useState("");

  const [tab, setTab] = useState("individual");
  const [touched, setTouched] = useState<FieldErrors>({});

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  function touch(field: string) {
    setTouched((p) => ({ ...p, [field]: true }));
  }

  function validate(): FieldErrors {
    const errs: FieldErrors = {};
    if (!name) errs.name = t("errorNameRequired");
    if (!email) errs.email = t("errorEmailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t("errorEmailInvalid");
    if (!password) errs.password = t("errorPasswordRequired");
    else if (password.length < 8) errs.password = t("errorPasswordMin");
    if (!confirmPassword) errs.confirmPassword = t("errorPasswordRequired");
    else if (password !== confirmPassword) errs.confirmPassword = t("errorPasswordMatch");
    if (tab === "company" && !companyName) errs.companyName = t("errorCompanyNameRequired");
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setTouched({ name: true, email: true, password: true, confirmPassword: true, companyName: true });
    if (Object.keys(errs).length > 0) return;
    toast.info(t("comingSoon"));
  }

  function fieldError(field: string): string {
    const errs = validate();
    return touched[field] ? (errs[field] ?? "") : "";
  }

  const errorBorder = (field: string) =>
    fieldError(field) ? " !border-red-500 focus-visible:!border-red-500" : "";

  /* ─── Shared inputs ─── */
  const sharedFields = (
    <>
      {/* Name */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="reg-name" className="text-[var(--text-muted)]">
          {t("name")}
        </Label>
        <div className="relative">
          <User
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
            size={18}
            strokeWidth={1.75}
          />
          <Input
            id="reg-name"
            type="text"
            placeholder={t("namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => touch("name")}
            aria-invalid={!!fieldError("name")}
            className={"glass-input ps-10 h-11" + errorBorder("name")}
            autoComplete="name"
          />
        </div>
        {fieldError("name") && (
          <p className="text-xs text-red-400" role="alert">{fieldError("name")}</p>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="reg-email" className="text-[var(--text-muted)]">
          {t("email")}
        </Label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
            size={18}
            strokeWidth={1.75}
          />
          <Input
            id="reg-email"
            type="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => touch("email")}
            aria-invalid={!!fieldError("email")}
            className={"glass-input ps-10 h-11" + errorBorder("email")}
            autoComplete="email"
          />
        </div>
        {fieldError("email") && (
          <p className="text-xs text-red-400" role="alert">{fieldError("email")}</p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="reg-password" className="text-[var(--text-muted)]">
          {t("password")}
        </Label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
            size={18}
            strokeWidth={1.75}
          />
          <Input
            id="reg-password"
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => touch("password")}
            aria-invalid={!!fieldError("password")}
            className={"glass-input ps-10 h-11" + errorBorder("password")}
            autoComplete="new-password"
          />
        </div>
        {fieldError("password") && (
          <p className="text-xs text-red-400" role="alert">{fieldError("password")}</p>
        )}
        {password && <StrengthBar strength={strength} label={t("passwordStrength")} />}
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="reg-confirm" className="text-[var(--text-muted)]">
          {t("confirmPassword")}
        </Label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
            size={18}
            strokeWidth={1.75}
          />
          <Input
            id="reg-confirm"
            type="password"
            placeholder={t("confirmPasswordPlaceholder")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => touch("confirmPassword")}
            aria-invalid={!!fieldError("confirmPassword")}
            className={"glass-input ps-10 h-11" + errorBorder("confirmPassword")}
            autoComplete="new-password"
          />
        </div>
        {fieldError("confirmPassword") && (
          <p className="text-xs text-red-400" role="alert">{fieldError("confirmPassword")}</p>
        )}
      </div>

      {/* Country */}
      <div className="flex flex-col gap-2">
        <Label className="text-[var(--text-muted)]">{t("country")}</Label>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="glass-input h-11 w-full border-white/10 text-[var(--text-muted)]">
            <Globe
              className="me-2 text-[var(--text-faint)] inline"
              size={16}
              strokeWidth={1.75}
            />
            <SelectValue placeholder={t("countryPlaceholder")} />
          </SelectTrigger>
          <SelectContent className="bg-[var(--bg-panel)] border-white/10">
            <SelectItem value="sa">{t("countrySaudi")}</SelectItem>
            <SelectItem value="ae">{t("countryUAE")}</SelectItem>
            <SelectItem value="qa">{t("countryQatar")}</SelectItem>
            <SelectItem value="bh">{t("countryBahrain")}</SelectItem>
            <SelectItem value="kw">{t("countryKuwait")}</SelectItem>
            <SelectItem value="om">{t("countryOman")}</SelectItem>
            <SelectItem value="jo">{t("countryJordan")}</SelectItem>
            <SelectItem value="eg">{t("countryEgypt")}</SelectItem>
            <SelectItem value="other">{t("countryOther")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  return (
    <AuthShell title={t("registerTitle")} showBack>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mx-auto flex w-full bg-white/5">
            <TabsTrigger
              value="individual"
              className="flex-1 data-[state=active]:bg-[var(--gold)] data-[state=active]:text-[var(--bg-void)] data-[state=active]:shadow-none text-[var(--text-muted)]"
            >
              {t("tabIndividual")}
            </TabsTrigger>
            <TabsTrigger
              value="company"
              className="flex-1 data-[state=active]:bg-[var(--gold)] data-[state=active]:text-[var(--bg-void)] data-[state=active]:shadow-none text-[var(--text-muted)]"
            >
              {t("tabCompany")}
            </TabsTrigger>
          </TabsList>

          {/* ─── Individual Tab ─── */}
          <TabsContent value="individual" className="flex flex-col gap-5 mt-5">
            {sharedFields}
          </TabsContent>

          {/* ─── Company Tab ─── */}
          <TabsContent value="company" className="flex flex-col gap-5 mt-5">
            {/* Company Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="reg-company" className="text-[var(--text-muted)]">
                {t("companyName")}
              </Label>
              <div className="relative">
                <Building2
                  className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
                  size={18}
                  strokeWidth={1.75}
                />
                <Input
                  id="reg-company"
                  type="text"
                  placeholder={t("companyNamePlaceholder")}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onBlur={() => touch("companyName")}
                  aria-invalid={!!fieldError("companyName")}
                  className={"glass-input ps-10 h-11" + errorBorder("companyName")}
                  autoComplete="organization"
                />
              </div>
              {fieldError("companyName") && (
                <p className="text-xs text-red-400" role="alert">{fieldError("companyName")}</p>
              )}
            </div>

            {sharedFields}

            {/* Company Size */}
            <div className="flex flex-col gap-2">
              <Label className="text-[var(--text-muted)]">{t("companySize")}</Label>
              <Select value={companySize} onValueChange={setCompanySize}>
                <SelectTrigger className="glass-input h-11 w-full border-white/10 text-[var(--text-muted)]">
                  <SelectValue placeholder={t("companySizePlaceholder")} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-panel)] border-white/10">
                  <SelectItem value="small">{t("sizeSmall")}</SelectItem>
                  <SelectItem value="medium">{t("sizeMedium")}</SelectItem>
                  <SelectItem value="large">{t("sizeLarge")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Company Sector */}
            <div className="flex flex-col gap-2">
              <Label className="text-[var(--text-muted)]">{t("companySector")}</Label>
              <Select value={companySector} onValueChange={setCompanySector}>
                <SelectTrigger className="glass-input h-11 w-full border-white/10 text-[var(--text-muted)]">
                  <SelectValue placeholder={t("companySectorPlaceholder")} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-panel)] border-white/10">
                  <SelectItem value="tech">{t("sectorTech")}</SelectItem>
                  <SelectItem value="finance">{t("sectorFinance")}</SelectItem>
                  <SelectItem value="healthcare">{t("sectorHealthcare")}</SelectItem>
                  <SelectItem value="education">{t("sectorEducation")}</SelectItem>
                  <SelectItem value="engineering">{t("sectorEngineering")}</SelectItem>
                  <SelectItem value="marketing">{t("sectorMarketing")}</SelectItem>
                  <SelectItem value="hr">{t("sectorHr")}</SelectItem>
                  <SelectItem value="other">{t("sectorOther")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit */}
        <button
          type="submit"
          className="btn-gold w-full cursor-pointer text-sm"
        >
          {tCommon("submit")}
        </button>

        {/* Sign in link */}
        <p className="text-center text-sm text-[var(--text-muted)]">
          {t("hasAccount")}{" "}
          <Link
            href={`/${locale}/auth/signin`}
            className="font-semibold text-[var(--gold)] hover:text-[var(--gold-hover)] transition-colors"
          >
            {t("signinLink")}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
