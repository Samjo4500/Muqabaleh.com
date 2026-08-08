import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';
import QRCode from 'qrcode';
import type { CoachScoreResult } from './types';
import { getInterviewConfig } from './config';

const colors = {
  ink: '#0a1220',
  teal: '#2dd4bf',
  muted: '#64748b',
  line: '#e2e8f0',
  paper: '#f8fafc',
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: colors.ink,
    backgroundColor: '#ffffff',
  },
  brand: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: colors.teal,
    marginBottom: 16,
    fontFamily: 'Helvetica-Bold',
  },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 110, color: colors.muted },
  value: { flex: 1, fontFamily: 'Helvetica-Bold' },
  scoreBox: {
    marginTop: 16,
    marginBottom: 16,
    padding: 14,
    backgroundColor: colors.paper,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  score: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: colors.teal },
  section: { marginTop: 14, marginBottom: 6, fontFamily: 'Helvetica-Bold', fontSize: 12 },
  barTrack: {
    height: 8,
    backgroundColor: colors.line,
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 8,
  },
  barFill: { height: 8, backgroundColor: colors.teal, borderRadius: 4 },
  bullet: { marginBottom: 3, paddingLeft: 6 },
  footer: { marginTop: 24, fontSize: 9, color: colors.muted },
  share: { marginTop: 10, fontSize: 9, color: colors.ink },
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
};

function PassportDoc({
  data,
  qrDataUrl,
}: {
  data: PassportPdfInput;
  qrDataUrl: string | null;
}) {
  const cfg = getInterviewConfig();
  const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.verifyUrl)}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`My Muqabaleh Interview Passport: ${data.verifyUrl}`)}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`My Muqabaleh Interview Passport — score ${data.score.overallScore}`)}&url=${encodeURIComponent(data.verifyUrl)}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>{cfg.brand.name} · {cfg.brand.nameAr}</Text>
        <Text style={styles.title}>{cfg.brand.passportTitle}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Candidate</Text>
          <Text style={styles.value}>{data.candidateName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{data.interviewDate}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{data.role}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Industry</Text>
          <Text style={styles.value}>{data.industry}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Seniority</Text>
          <Text style={styles.value}>{data.seniority}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Language</Text>
          <Text style={styles.value}>{data.language}</Text>
        </View>

        <View style={styles.scoreBox}>
          <Text style={styles.score}>
            {data.score.overallScore} · {data.score.grade}
          </Text>
          <Text style={{ color: colors.muted, marginTop: 4 }}>
            Verification ID: {data.verificationId}
          </Text>
          <Text style={{ color: colors.muted, marginTop: 2 }}>
            Verify: {data.verifyUrl}
          </Text>
        </View>

        <Text style={styles.section}>Competency breakdown</Text>
        {data.score.competencyBreakdown.map((c) => (
          <View key={c.name}>
            <Text>
              {c.name}: {c.score}/100
            </Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${Math.max(0, Math.min(100, c.score))}%` }]} />
            </View>
          </View>
        ))}

        <Text style={styles.section}>Top strengths</Text>
        {data.score.strengths.slice(0, 3).map((s, i) => (
          <Text key={i} style={styles.bullet}>
            • {s}
          </Text>
        ))}

        <Text style={styles.section}>Improvement areas</Text>
        {data.score.improvements.slice(0, 3).map((s, i) => (
          <Text key={i} style={styles.bullet}>
            • {s}
          </Text>
        ))}

        <Text style={styles.section}>Recommended next steps</Text>
        <Text>{data.score.recommendedNextSteps}</Text>

        <Text style={styles.share}>Share: LinkedIn {linkedIn}</Text>
        <Text style={styles.share}>WhatsApp {whatsapp}</Text>
        <Text style={styles.share}>X {xUrl}</Text>

        {qrDataUrl ? (
          <View style={{ marginTop: 16, alignItems: 'flex-start' }}>
            <Image src={qrDataUrl} style={{ width: 96, height: 96 }} />
            <Text style={styles.footer}>Scan to verify on muqabaleh.com</Text>
          </View>
        ) : (
          <Text style={styles.footer}>Verify: {data.verifyUrl}</Text>
        )}
      </Page>
    </Document>
  );
}

export async function buildPassportPdfBuffer(data: PassportPdfInput): Promise<Buffer> {
  let qrDataUrl: string | null = null;
  try {
    qrDataUrl = await QRCode.toDataURL(data.verifyUrl, {
      margin: 1,
      width: 192,
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('[coach/passport-pdf] QR failed', err);
  }
  const buf = await renderToBuffer(<PassportDoc data={data} qrDataUrl={qrDataUrl} />);
  return Buffer.from(buf);
}
