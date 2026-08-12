export type ParsedUa = {
  browser: string;
  os: string;
  deviceClass: 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown';
  isBot: boolean;
};

const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora|redditbot|whatsapp|telegram|preview|headless|lighthouse|gtmetrix|pingdom|yandex|baidu|semrush|ahrefs|mj12|dotbot|petalbot/i;

export function parseUserAgent(uaRaw: string | null | undefined): ParsedUa {
  const ua = (uaRaw || '').trim();
  if (!ua) {
    return { browser: 'unknown', os: 'unknown', deviceClass: 'unknown', isBot: false };
  }

  const isBot = BOT_RE.test(ua);
  let os = 'unknown';
  if (/windows nt/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/mac os x/i.test(ua)) os = 'macOS';
  else if (/cros/i.test(ua)) os = 'ChromeOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = 'unknown';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/firefox\//i.test(ua)) browser = 'Firefox';
  else if (/crios\//i.test(ua)) browser = 'Chrome';
  else if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) browser = 'Chrome';
  else if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) browser = 'Safari';
  else if (/msie|trident/i.test(ua)) browser = 'IE';

  let deviceClass: ParsedUa['deviceClass'] = 'desktop';
  if (isBot) deviceClass = 'bot';
  else if (/ipad|tablet|kindle|silk/i.test(ua)) deviceClass = 'tablet';
  else if (/mobi|iphone|ipod|android.+mobile/i.test(ua)) deviceClass = 'mobile';

  return { browser, os, deviceClass, isBot };
}

export function hostFromReferrer(ref: string | null | undefined): string | null {
  if (!ref) return null;
  try {
    return new URL(ref).hostname.replace(/^www\./, '') || null;
  } catch {
    return null;
  }
}
