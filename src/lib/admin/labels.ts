/** Bilingual admin UI labels — professional Arabic meaning (not literal). Muqabaleh only. */

export type Bi = { ar: string; en: string };

export const L = {
  brand: { ar: 'لوحة تحكم المسؤول العام — مقابلة', en: 'Muqabaleh Super Admin Control' },
  systemAdmin: { ar: 'المسؤول العام', en: 'Super Admin' },
  signOut: { ar: 'تسجيل الخروج', en: 'Sign Out' },
  back: { ar: 'رجوع', en: 'Back' },
  dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
  search: { ar: 'بحث', en: 'Search' },
  refresh: { ar: 'تحديث', en: 'Refresh' },
  create: { ar: 'إنشاء', en: 'Create' },
  edit: { ar: 'تعديل', en: 'Edit' },
  delete: { ar: 'حذف', en: 'Delete' },
  save: { ar: 'حفظ', en: 'Save' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  actions: { ar: 'إجراءات', en: 'Actions' },
  status: { ar: 'الحالة', en: 'Status' },
  loading: { ar: 'جارٍ التحميل…', en: 'Loading…' },
  empty: { ar: 'لا توجد بيانات', en: 'No data yet' },
  error: { ar: 'حدث خطأ', en: 'Something went wrong' },
  success: { ar: 'تم بنجاح', en: 'Success' },
  theme: { ar: 'المظهر', en: 'Theme' },
  light: { ar: 'فاتح', en: 'Light' },
  dark: { ar: 'داكن', en: 'Dark' },
  collapse: { ar: 'طي القائمة', en: 'Collapse sidebar' },
  expand: { ar: 'توسيع القائمة', en: 'Expand sidebar' },
  home: { ar: 'الرئيسية', en: 'Home' },
  overview: { ar: 'نظرة عامة', en: 'Overview' },
  exportCsv: { ar: 'تصدير CSV', en: 'Export CSV' },
  exportExcel: { ar: 'تصدير Excel', en: 'Export Excel' },
  activate: { ar: 'تفعيل', en: 'Activate' },
  deactivate: { ar: 'تعطيل', en: 'Deactivate' },
  emailAction: { ar: 'إرسال بريد', en: 'Email' },
  bulkActions: { ar: 'إجراءات جماعية', en: 'Bulk actions' },
  filter: { ar: 'تصفية', en: 'Filter' },
  sort: { ar: 'فرز', en: 'Sort' },
  // Users — المستخدمون
  users: { ar: 'المستخدمون', en: 'Users' },
  allUsers: { ar: 'الجميع', en: 'All Users' },
  candidates: { ar: 'المرشحون', en: 'Candidates' },
  admins: { ar: 'المسؤولون', en: 'Admins' },
  companies: { ar: 'الشركات', en: 'Companies' },
  // Interviews — المقابلات
  interviews: { ar: 'المقابلات', en: 'Interviews' },
  templates: { ar: 'نماذج المقابلات', en: 'Templates' },
  questions: { ar: 'بنك الأسئلة', en: 'Question Bank' },
  sessions: { ar: 'الجلسات المباشرة', en: 'Live Sessions' },
  rubrics: { ar: 'معايير التقييم', en: 'Scoring Rubrics' },
  // Partners — الشركاء
  partners: { ar: 'الشركاء', en: 'Partners' },
  whitelabel: { ar: 'العلامة التجارية الخاصة', en: 'Whitelabel' },
  applications: { ar: 'طلبات الانضمام للشراكة', en: 'Applications' },
  revenueShare: { ar: 'مشاركة الأرباح', en: 'Revenue Share' },
  revenue: { ar: 'مشاركة الأرباح', en: 'Revenue Share' },
  // Billing — الفوترة
  billing: { ar: 'الفوترة', en: 'Billing' },
  plans: { ar: 'باقات الاشتراك', en: 'Plans' },
  subscriptions: { ar: 'الاشتراكات النشطة', en: 'Active Subscriptions' },
  invoices: { ar: 'الفواتير', en: 'Invoices' },
  // Payments — المدفوعات
  payments: { ar: 'المدفوعات', en: 'Payments' },
  transactions: { ar: 'سجل العمليات المالية', en: 'Transactions' },
  payouts: { ar: 'التحويلات للشركاء', en: 'Payouts' },
  financialOverview: { ar: 'الملخص المالي', en: 'Financial Overview' },
  // AI — الذكاء الاصطناعي
  aiApis: { ar: 'الذكاء الاصطناعي', en: 'AI & APIs' },
  providers: { ar: 'خدمات الذكاء الاصطناعي', en: 'Providers' },
  keys: { ar: 'مفاتيح API', en: 'API Keys' },
  prompts: { ar: 'التعليمات النصية', en: 'Prompts' },
  usage: { ar: 'الاستهلاك والتكلفة', en: 'Usage' },
  // Content — المحتوى
  content: { ar: 'المحتوى', en: 'Content' },
  landing: { ar: 'الصفحة الهبوط', en: 'Landing Page' },
  emails: { ar: 'قوالب البريد الإلكتروني', en: 'Emails' },
  // Analytics — التحليلات
  analytics: { ar: 'التحليلات', en: 'Analytics' },
  website: { ar: 'أداء الموقع', en: 'Website' },
  behavior: { ar: 'تحليلات سلوك المستخدمين', en: 'Behavior' },
  // Settings — الإعدادات
  settings: { ar: 'الإعدادات', en: 'Settings' },
  general: { ar: 'الإعدادات العامة', en: 'General' },
  security: { ar: 'إعدادات الحماية', en: 'Security' },
  access: { ar: 'إدارة صلاحيات الوصول', en: 'Access' },
  backup: { ar: 'النسخ الاحتياطي والصيانة', en: 'Backup' },
  // Support — الدعم الفني
  support: { ar: 'الدعم الفني', en: 'Support' },
  tickets: { ar: 'طلبات الدعم الفني', en: 'Tickets' },
  chat: { ar: 'الدردشة المباشرة', en: 'Chat' },
  // Top-level
  notifications: { ar: 'مركز التنبيهات', en: 'Notification Center' },
  audit: { ar: 'سجلات النشاط', en: 'Audit Logs' },
  applicants: { ar: 'قاعدة بيانات المتقدمين', en: 'Applicants' },
  refund: { ar: 'استرداد المبلغ', en: 'Refund' },
  enable2fa: { ar: 'تفعيل المصادقة الثنائية', en: 'Enable 2FA' },
  verify2fa: { ar: 'رمز المصادقة', en: 'Verification code' },
  // Dashboard widgets
  todaysInterviews: { ar: 'مقابلات اليوم', en: "Today's Interviews" },
  newSignups: { ar: 'مستخدمون جدد', en: 'New Signups' },
  revenueToday: { ar: 'الإيرادات اليومية', en: 'Revenue Today' },
  activeCompanies: { ar: 'الشركات النشطة', en: 'Active Companies' },
  pendingTickets: { ar: 'طلبات الدعم المعلقة', en: 'Pending Support Tickets' },
  apiHealth: { ar: 'حالة خدمات API', en: 'API Health Status' },
  visitors24h: { ar: 'عدد الزيارات (٢٤ ساعة)', en: 'Visitor Count (24h)' },
  revenueTrend: { ar: 'اتجاه الإيرادات', en: 'Revenue trend' },
  completionRate: { ar: 'نسبة إكمال المقابلات', en: 'Interview completion rate' },
  userGrowth: { ar: 'نمو المستخدمين حسب النوع', en: 'User growth by type (B2C vs B2B)' },
  topIndustries: { ar: 'أكثر القطاعات مقابلات', en: 'Top industries interviewed for' },
  // Misc ops kept for legacy routes
  legacyOps: { ar: 'عمليات إضافية', en: 'Extra Ops' },
  interviewers: { ar: 'المحاورون', en: 'Interviewers' },
  bookings: { ar: 'الحجوزات', en: 'Bookings' },
} as const satisfies Record<string, Bi>;

export type LabelKey = keyof typeof L;

export function bi(key: LabelKey): Bi {
  return L[key];
}
