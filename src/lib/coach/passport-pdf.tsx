import React from 'react';
import path from 'path';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  renderToBuffer,
} from '@react-pdf/renderer';
import QRCode from 'qrcode';
import type { CoachScoreResult } from './types';
import { getInterviewConfig } from './config';
import { MUQABALEH_BRAND } from '@/lib/brand/comms';

const C = MUQABALEH_BRAND.colors;

try {
  Font.register({
    family: 'Amiri',
    fonts: [
      {
        src: path.join(process.cwd(), 'public/fonts/Amiri-Regular.ttf'),
        fontWeight: 'normal',
      },
      {
        src: path.join(process.cwd(), 'public/fonts/Amiri-Bold.ttf'),
        fontWeight: 'bold',
      },
    ],
  });
} catch (err) {
  console.error('[coach/passport-pdf] font register failed', err);
}

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: C.ink,
    backgroundColor: C.white,
  },
  pageAr: {
    fontFamily: 'Amiri',
  },
  topAccent: {
    height: 4,
    backgroundColor: C.teal,
  },
  header: {
    backgroundColor: C.navy,
    paddingTop: 18,
    paddingBottom: 16,
    paddingHorizontal: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  brandMark: {
    color: C.white,
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.4,
  },
  brandMarkAr: {
    fontFamily: 'Amiri',
    fontWeight: 'bold',
    fontSize: 20,
  },
  brandSub: {
    color: C.tealSoft,
    fontSize: 9,
    marginTop: 3,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  brandSubAr: {
    fontFamily: 'Amiri',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 0,
    textTransform: 'none',
  },
  verifiedPill: {
    borderWidth: 1,
    borderColor: C.teal,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(20,184,166,0.12)',
  },
  verifiedText: {
    color: C.tealSoft,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  body: {
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 14,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 8,
    backgroundColor: C.paperSoft,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  metaCell: {
    width: '33.33%',
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  metaLabel: {
    color: C.muted,
    fontSize: 7,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metaValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: C.ink,
  },
  scoreBand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.navy,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 8,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreNumber: {
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
    lineHeight: 1.05,
  },
  scoreOutOf: {
    color: C.tealSoft,
    fontSize: 10,
    marginTop: 2,
    fontFamily: 'Helvetica-Bold',
  },
  gradeRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.navyDeep,
  },
  gradeText: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: C.tealSoft,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: C.navy,
    marginBottom: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridItem: {
    width: '48.5%',
    marginBottom: 7,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 6,
    backgroundColor: C.white,
  },
  barTrack: {
    height: 4,
    backgroundColor: C.line,
    borderRadius: 2,
    marginTop: 4,
  },
  barFill: { height: 4, backgroundColor: C.teal, borderRadius: 2 },
  twoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  col: {
    width: '48.5%',
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 8,
    padding: 8,
    backgroundColor: C.paperSoft,
    minHeight: 78,
  },
  bullet: {
    marginBottom: 3,
    fontSize: 8,
    color: C.body,
    lineHeight: 1.35,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 8,
    gap: 10,
  },
  footerText: {
    flex: 1,
    fontSize: 7,
    color: C.muted,
    lineHeight: 1.4,
  },
  footerId: {
    fontFamily: 'Helvetica-Bold',
    color: C.ink,
    fontSize: 7.5,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 22,
    backgroundColor: C.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  bottomBarText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 7,
  },
  bottomBarAccent: {
    color: C.tealSoft,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
  },
});

export type PassportPdfInput = {
  candidateName: string;
  role: string;
  industry: string;
  seniority: string;
  language: string;
  interviewDate: string;
  score: CoachScoreResult;
  verificationId: string;
  verifyUrl: string;
  /** When true, use Arabic/RTL layout */
  rtl?: boolean;
};

function clip(text: string, max: number): string {
  const t = (text || '').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function PassportDoc({
  data,
  qrDataUrl,
}: {
  data: PassportPdfInput;
  qrDataUrl: string | null;
}) {
  const cfg = getInterviewConfig();
  const rtl = Boolean(data.rtl);
  const title = rtl
    ? cfg.brand.passportTitleAr || 'جواز المقابلة'
    : cfg.brand.passportTitle;
  const L = rtl
    ? {
        candidate: 'المرشح',
        date: 'التاريخ',
        role: 'الدور',
        industry: 'القطاع',
        seniority: 'المستوى',
        language: 'اللغة',
        overall: 'الدرجة الكلية',
        of100: 'من 100',
        competencies: 'الكفاءات',
        strengths: 'نقاط القوة',
        improvements: 'للتحسين',
        scan: 'امسح للتحقق',
        verified: 'شهادة موثّقة',
        generated: 'تم إنشاء هذا الجواز بواسطة مدرب المقابلات الذكي في مقابلة',
      }
    : {
        candidate: 'Candidate',
        date: 'Date',
        role: 'Role',
        industry: 'Industry',
        seniority: 'Seniority',
        language: 'Language',
        overall: 'Overall score',
        of100: 'of 100',
        competencies: 'Competencies',
        strengths: 'Strengths',
        improvements: 'Improvements',
        scan: 'Scan to verify',
        verified: 'Verified credential',
        generated: 'Generated by Muqabaleh AI Interview Coach',
      };

  const comps = [...data.score.competencyBreakdown];
  while (comps.length < 6) {
    comps.push({ name: rtl ? 'القيادة' : 'Leadership', score: data.score.overallScore });
  }

  const dirStyle = rtl ? { flexDirection: 'row-reverse' as const } : {};
  const textAlign = rtl ? ('right' as const) : ('left' as const);
  const arFont = rtl ? { fontFamily: 'Amiri' as const } : {};
  const arBold = rtl
    ? { fontFamily: 'Amiri' as const, fontWeight: 'bold' as const }
    : {};

  const meta = [
    [L.candidate, clip(data.candidateName, 42)],
    [L.date, data.interviewDate],
    [L.role, clip(data.role, 36)],
    [L.industry, clip(data.industry, 36)],
    [L.seniority, clip(data.seniority, 28)],
    [L.language, clip(data.language, 28)],
  ] as const;

  return (
    <Document>
      <Page size="A4" style={[styles.page, rtl ? styles.pageAr : {}]}>
        <View style={styles.topAccent} />
        <View style={[styles.header, dirStyle]}>
          <View style={{ alignItems: rtl ? 'flex-end' : 'flex-start' }}>
            <Text style={[styles.brandMark, rtl ? styles.brandMarkAr : {}]}>
              {rtl ? cfg.brand.nameAr : cfg.brand.name}
            </Text>
            <Text style={[styles.brandSub, rtl ? styles.brandSubAr : {}]}>
              {title}
            </Text>
          </View>
          <View style={styles.verifiedPill}>
            <Text style={[styles.verifiedText, arBold]}>{L.verified}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={[styles.metaGrid, dirStyle]}>
            {meta.map(([label, value]) => (
              <View
                key={label}
                style={[styles.metaCell, { alignItems: rtl ? 'flex-end' : 'flex-start' }]}
              >
                <Text style={[styles.metaLabel, arFont, { textAlign }]}>{label}</Text>
                <Text style={[styles.metaValue, arBold, { textAlign }]}>{value}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.scoreBand, dirStyle]}>
            <View style={{ alignItems: rtl ? 'flex-end' : 'flex-start' }}>
              <Text style={[styles.scoreLabel, arFont]}>{L.overall}</Text>
              <Text style={styles.scoreNumber}>{data.score.overallScore}</Text>
              <Text style={[styles.scoreOutOf, arFont]}>{L.of100}</Text>
            </View>
            <View style={styles.gradeRing}>
              <Text style={styles.gradeText}>{data.score.grade}</Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, arBold, { textAlign }]}>
            {L.competencies}
          </Text>
          <View style={[styles.grid, dirStyle]}>
            {comps.slice(0, 6).map((c) => (
              <View key={c.name} style={styles.gridItem}>
                <View
                  style={[
                    {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    },
                    dirStyle,
                  ]}
                >
                  <Text style={[{ fontSize: 8, color: C.ink, maxWidth: '78%' }, arFont]}>
                    {clip(c.name, rtl ? 22 : 26)}
                  </Text>
                  <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.navy }}>
                    {c.score}
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.max(0, Math.min(100, c.score))}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.twoCol, dirStyle]}>
            <View style={styles.col}>
              <Text style={[styles.sectionTitle, arBold, { textAlign, marginBottom: 4 }]}>
                {L.strengths}
              </Text>
              {data.score.strengths.slice(0, 3).map((s, i) => (
                <Text key={i} style={[styles.bullet, arFont, { textAlign }]}>
                  {`• ${clip(s, rtl ? 90 : 95)}`}
                </Text>
              ))}
            </View>
            <View style={styles.col}>
              <Text style={[styles.sectionTitle, arBold, { textAlign, marginBottom: 4 }]}>
                {L.improvements}
              </Text>
              {data.score.improvements.slice(0, 3).map((s, i) => (
                <Text key={i} style={[styles.bullet, arFont, { textAlign }]}>
                  {`• ${clip(s, rtl ? 90 : 95)}`}
                </Text>
              ))}
            </View>
          </View>

          <View style={[styles.footerRow, dirStyle]}>
            {qrDataUrl ? (
              <View style={{ alignItems: 'center' }}>
                <Image src={qrDataUrl} style={{ width: 64, height: 64 }} />
                <Text style={[{ fontSize: 6.5, color: C.muted, marginTop: 2 }, arFont]}>
                  {L.scan}
                </Text>
              </View>
            ) : null}
            <View style={[styles.footerText, { alignItems: rtl ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.footerId, arBold, { textAlign }]}>
                {data.verificationId}
              </Text>
              <Text style={[{ marginTop: 2 }, arFont, { textAlign }]}>
                {data.verifyUrl}
              </Text>
              <Text style={[{ marginTop: 3 }, arFont, { textAlign }]}>{L.generated}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.bottomBar, dirStyle]} fixed>
          <Text style={[styles.bottomBarAccent, arBold]}>
            {rtl ? cfg.brand.nameAr : cfg.brand.name}
          </Text>
          <Text style={[styles.bottomBarText, arFont]}>muqabaleh.com</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function buildPassportPdfBuffer(data: PassportPdfInput): Promise<Buffer> {
  let qrDataUrl: string | null = null;
  try {
    qrDataUrl = await QRCode.toDataURL(data.verifyUrl, {
      margin: 1,
      width: 160,
      errorCorrectionLevel: 'M',
      color: { dark: C.navy, light: '#FFFFFF' },
    });
  } catch (err) {
    console.error('[coach/passport-pdf] QR failed', err);
  }

  const rtl =
    data.rtl ??
    (/arabic|عربي|العربية/i.test(data.language) ||
      data.language === 'ar' ||
      data.language === 'AR');

  const buf = await renderToBuffer(
    <PassportDoc data={{ ...data, rtl }} qrDataUrl={qrDataUrl} />,
  );
  return Buffer.from(buf);
}
