'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Mail, User, Building2, Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getSession, signIn } from 'next-auth/react';

import { AuthShell } from '@/components/brand';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PasswordField,
  PasswordStrengthMeter,
} from '@/components/auth/PasswordField';
import { resolvePostAuthPath } from '@/lib/auth-redirect';
import { localePath } from '@/i18n/navigation';
import { attributionPayload } from '@/lib/marketing/attribution';
import { MENA_COUNTRIES, INDUSTRIES, EXPERIENCES } from '@/lib/constants';

type FieldErrors = Record<string, string>;

const SIZE_MAP: Record<string, string> = {
  small: 'SMALL',
  medium: 'MEDIUM',
  large: 'LARGE',
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-white/60">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [desiredRole, setDesiredRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [experience, setExperience] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [companySector, setCompanySector] = useState('');
  const [tab, setTab] = useState('individual');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  function touch(field: string) {
    setTouched((p) => ({ ...p, [field]: true }));
  }

  function validate(): FieldErrors {
    const errs: FieldErrors = {};
    if (!name) errs.name = t('errorNameRequired');
    if (!email) errs.email = t('errorEmailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t('errorEmailInvalid');
    if (!password) errs.password = t('errorPasswordRequired');
    else if (password.length < 8) errs.password = t('errorPasswordMin');
    if (!confirmPassword) errs.confirmPassword = t('errorPasswordRequired');
    else if (password !== confirmPassword) errs.confirmPassword = t('errorPasswordMatch');
    if (tab === 'company' && !companyName) errs.companyName = t('errorCompanyNameRequired');
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      companyName: true,
    });
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const isCompany = tab === 'company';
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountType: isCompany ? 'B2B' : 'INDIVIDUAL',
          email: email.trim().toLowerCase(),
          password,
          name: name.trim(),
          country: country || undefined,
          phone: phone.trim() || undefined,
          role: !isCompany ? desiredRole.trim() || undefined : undefined,
          industry: !isCompany ? industry || undefined : undefined,
          experience: !isCompany ? experience || undefined : undefined,
          marketingOptIn,
          locale,
          companyName: isCompany ? companyName.trim() : undefined,
          companySize: isCompany ? SIZE_MAP[companySize] || companySize || undefined : undefined,
          companyIndustry: isCompany ? companySector || undefined : undefined,
          companyCountry: isCompany ? country || undefined : undefined,
          ...attributionPayload(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(
          data.error ||
            (res.status === 409 ? t('emailExists') : t('loginFailed')),
        );
        return;
      }

      toast.success(t('registerSuccess'));

      const login = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (login?.error) {
        router.push(
          localePath(
            callbackUrl
              ? `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
              : '/auth/signin',
            locale,
          ),
        );
        return;
      }

      const session = await getSession();
      const role =
        (session?.user as { role?: string } | undefined)?.role || data.role;
      // Prefer callbackUrl for candidates returning to interview/jobs;
      // otherwise use API redirect / role home.
      const dest = resolvePostAuthPath({
        locale,
        role,
        callbackUrl: callbackUrl || data.redirectTo || null,
      });
      router.push(dest);
      router.refresh();
    } catch {
      toast.error(t('loginFailed'));
    } finally {
      setLoading(false);
    }
  }

  function fieldError(field: string): string {
    const errs = validate();
    return touched[field] ? (errs[field] ?? '') : '';
  }

  const errorBorder = (field: string) =>
    fieldError(field) ? ' !border-red-500 focus-visible:!border-red-500' : '';

  const showPw = t('showPassword');
  const hidePw = t('hidePassword');

  const sharedFields = (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="reg-name" className="text-white/60">
          {t('name')}
        </Label>
        <div className="relative">
          <User
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-white/40"
            size={18}
            strokeWidth={1.75}
          />
          <Input
            id="reg-name"
            type="text"
            placeholder={t('namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => touch('name')}
            aria-invalid={!!fieldError('name')}
            className={'glass-input ps-10 h-11' + errorBorder('name')}
            autoComplete="name"
          />
        </div>
        {fieldError('name') ? (
          <p className="text-xs text-red-400" role="alert">
            {fieldError('name')}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="reg-email" className="text-white/60">
          {t('email')}
        </Label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-white/40"
            size={18}
            strokeWidth={1.75}
          />
          <Input
            id="reg-email"
            type="email"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => touch('email')}
            aria-invalid={!!fieldError('email')}
            className={'glass-input ps-10 h-11' + errorBorder('email')}
            autoComplete="email"
          />
        </div>
        {fieldError('email') ? (
          <p className="text-xs text-red-400" role="alert">
            {fieldError('email')}
          </p>
        ) : null}
      </div>

      <PasswordField
        id="reg-password"
        label={t('password')}
        value={password}
        onChange={setPassword}
        onBlur={() => touch('password')}
        placeholder={t('passwordPlaceholder')}
        autoComplete="new-password"
        error={fieldError('password')}
        showLabel={showPw}
        hideLabel={hidePw}
      />
      <PasswordStrengthMeter
        password={password}
        label={t('passwordStrength')}
        weakLabel={t('strengthWeak')}
        mediumLabel={t('strengthMedium')}
        strongLabel={t('strengthStrong')}
      />

      <PasswordField
        id="reg-confirm"
        label={t('confirmPassword')}
        value={confirmPassword}
        onChange={setConfirmPassword}
        onBlur={() => touch('confirmPassword')}
        placeholder={t('confirmPasswordPlaceholder')}
        autoComplete="new-password"
        error={fieldError('confirmPassword')}
        showLabel={showPw}
        hideLabel={hidePw}
      />

      <div className="flex flex-col gap-2">
        <Label className="text-white/60">{t('country')}</Label>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="glass-input h-11 w-full border-white/10 text-white/60">
            <Globe className="me-2 inline text-white/40" size={16} strokeWidth={1.75} />
            <SelectValue placeholder={t('countryPlaceholder')} />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#0a1220]">
            {MENA_COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {locale === 'ar' ? c.name_ar : c.name_en}
              </SelectItem>
            ))}
            <SelectItem value="other">{t('countryOther')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="reg-phone" className="text-white/60">
          {t('phone')}
        </Label>
        <Input
          id="reg-phone"
          type="tel"
          placeholder={t('phonePlaceholder')}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="glass-input h-11"
          autoComplete="tel"
        />
      </div>
    </>
  );

  return (
    <AuthShell title={t('registerTitle')} showBack>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <p className="rounded-xl border border-teal-300/20 bg-teal-400/10 px-4 py-3 text-sm leading-relaxed text-teal-50/90">
          {t('passportPrivacyNote')}
        </p>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mx-auto flex w-full bg-white/5">
            <TabsTrigger
              value="individual"
              className="flex-1 text-white/60 data-[state=active]:bg-teal-400/25 data-[state=active]:text-teal-100 data-[state=active]:shadow-none"
            >
              {t('tabIndividual')}
            </TabsTrigger>
            <TabsTrigger
              value="company"
              className="flex-1 text-white/60 data-[state=active]:bg-teal-400/25 data-[state=active]:text-teal-100 data-[state=active]:shadow-none"
            >
              {t('tabCompany')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="mt-5 flex flex-col gap-5">
            {sharedFields}
            <div className="flex flex-col gap-2">
              <Label htmlFor="reg-role" className="text-white/60">
                {t('desiredRole')}
              </Label>
              <Input
                id="reg-role"
                value={desiredRole}
                onChange={(e) => setDesiredRole(e.target.value)}
                placeholder={t('desiredRolePlaceholder')}
                className="glass-input h-11"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-white/60">{t('industryIndividual')}</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="glass-input h-11 w-full border-white/10 text-white/60">
                    <SelectValue placeholder={t('companySectorPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#0a1220]">
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-white/60">{t('experienceIndividual')}</Label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger className="glass-input h-11 w-full border-white/10 text-white/60">
                    <SelectValue placeholder={t('experienceIndividual')} />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#0a1220]">
                    {EXPERIENCES.map((exp) => (
                      <SelectItem key={exp} value={exp}>
                        {exp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="company" className="mt-5 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="reg-company" className="text-white/60">
                {t('companyName')}
              </Label>
              <div className="relative">
                <Building2
                  className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-white/40"
                  size={18}
                  strokeWidth={1.75}
                />
                <Input
                  id="reg-company"
                  type="text"
                  placeholder={t('companyNamePlaceholder')}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onBlur={() => touch('companyName')}
                  aria-invalid={!!fieldError('companyName')}
                  className={'glass-input ps-10 h-11' + errorBorder('companyName')}
                  autoComplete="organization"
                />
              </div>
              {fieldError('companyName') ? (
                <p className="text-xs text-red-400" role="alert">
                  {fieldError('companyName')}
                </p>
              ) : null}
            </div>

            {sharedFields}

            <div className="flex flex-col gap-2">
              <Label className="text-white/60">{t('companySize')}</Label>
              <Select value={companySize} onValueChange={setCompanySize}>
                <SelectTrigger className="glass-input h-11 w-full border-white/10 text-white/60">
                  <SelectValue placeholder={t('companySizePlaceholder')} />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#0a1220]">
                  <SelectItem value="small">{t('sizeSmall')}</SelectItem>
                  <SelectItem value="medium">{t('sizeMedium')}</SelectItem>
                  <SelectItem value="large">{t('sizeLarge')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-white/60">{t('companySector')}</Label>
              <Select value={companySector} onValueChange={setCompanySector}>
                <SelectTrigger className="glass-input h-11 w-full border-white/10 text-white/60">
                  <SelectValue placeholder={t('companySectorPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#0a1220]">
                  <SelectItem value="tech">{t('sectorTech')}</SelectItem>
                  <SelectItem value="finance">{t('sectorFinance')}</SelectItem>
                  <SelectItem value="healthcare">{t('sectorHealthcare')}</SelectItem>
                  <SelectItem value="education">{t('sectorEducation')}</SelectItem>
                  <SelectItem value="engineering">{t('sectorEngineering')}</SelectItem>
                  <SelectItem value="marketing">{t('sectorMarketing')}</SelectItem>
                  <SelectItem value="hr">{t('sectorHr')}</SelectItem>
                  <SelectItem value="other">{t('sectorOther')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <label className="flex cursor-pointer items-start gap-3 text-sm text-white/65">
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(e) => setMarketingOptIn(e.target.checked)}
            className="mt-1 h-4 w-4 accent-teal-400"
          />
          <span>{t('marketingOptIn')}</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mq-btn mq-btn-primary flex w-full min-h-[48px] cursor-pointer items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : null}
          {tCommon('submit')}
        </button>

        <p className="text-center text-sm text-white/60">
          {t('hasAccount')}{' '}
          <Link
            href={localePath(
              callbackUrl
                ? `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
                : '/auth/signin',
              locale,
            )}
            className="font-semibold text-teal-300 transition-colors hover:text-teal-200"
          >
            {t('signinLink')}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
