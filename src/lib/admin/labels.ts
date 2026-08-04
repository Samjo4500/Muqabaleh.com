/** Bilingual admin UI labels — Arabic + English shown simultaneously. Muqabaleh only. */

export type Bi = { ar: string; en: string };

export const L = {
  brand: { ar: 'لوحة تحكم مقابلة', en: 'Muqabaleh Admin' },
  systemAdmin: { ar: 'مشرف أعلى', en: 'Super Admin' },
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
  // Users
  users: { ar: 'المستخدمين', en: 'Users' },
  allUsers: { ar: 'الجميع', en: 'All Users' },
  candidates: { ar: 'المرشحون', en: 'Candidates' },
  admins: { ar: 'المشرفون', en: 'Admins' },
  companies: { ar: 'الشركات', en: 'Companies' },
  // Interviews
  interviews: { ar: 'المقابلات', en: 'Interviews' },
  templates: { ar: 'القوالب', en: 'Templates' },
  questions: { ar: 'بنك الأسئلة', en: 'Question Bank' },
  sessions: { ar: 'الجلسات الحية', en: 'Live Sessions' },
  rubrics: { ar: 'معايير التقييم', en: 'Scoring Rubrics' },
  // Partners
  partners: { ar: 'الشركاء', en: 'Partners' },
  whitelabel: { ar: 'العلامة البيضاء', en: 'Whitelabel' },
  applications: { ar: 'الطلبات', en: 'Applications' },
  revenueShare: { ar: 'تقاسم الإيرادات', en: 'Revenue Share' },
  revenue: { ar: 'تقاسم الإيرادات', en: 'Revenue Share' },
  // Billing
  billing: { ar: 'الفوترة', en: 'Billing' },
  plans: { ar: 'الخطط', en: 'Plans' },
  subscriptions: { ar: 'الاشتراكات', en: 'Subscriptions' },
  invoices: { ar: 'الفواتير', en: 'Invoices' },
  // Payments
  payments: { ar: 'المدفوعات', en: 'Payments' },
  transactions: { ar: 'المعاملات', en: 'Transactions' },
  payouts: { ar: 'المبالغ المدفوعة', en: 'Payouts' },
  financialOverview: { ar: 'النظرة المالية الشاملة', en: 'Financial Overview' },
  // AI
  aiApis: { ar: 'الذكاء الاصطناعي', en: 'AI & APIs' },
  providers: { ar: 'المزودون', en: 'Providers' },
  keys: { ar: 'مفاتيح API', en: 'API Keys' },
  prompts: { ar: 'الأوامر', en: 'Prompts' },
  usage: { ar: 'الاستهلاك', en: 'Usage' },
  // Content
  content: { ar: 'المحتوى', en: 'Content' },
  landing: { ar: 'الصفحة الرئيسية', en: 'Landing Page' },
  emails: { ar: 'البريد', en: 'Emails' },
  // Analytics
  analytics: { ar: 'التحليلات', en: 'Analytics' },
  website: { ar: 'الموقع', en: 'Website' },
  behavior: { ar: 'السلوك', en: 'Behavior' },
  // Settings
  settings: { ar: 'الإعدادات', en: 'Settings' },
  general: { ar: 'عام', en: 'General' },
  security: { ar: 'الأمان', en: 'Security' },
  access: { ar: 'الوصول', en: 'Access' },
  backup: { ar: 'النسخ الاحتياطي', en: 'Backup' },
  // Support
  support: { ar: 'الدعم', en: 'Support' },
  tickets: { ar: 'التذاكر', en: 'Tickets' },
  chat: { ar: 'الدردشة', en: 'Chat' },
  // Top-level
  notifications: { ar: 'الإشعارات', en: 'Notifications' },
  audit: { ar: 'سجلات التدقيق', en: 'Audit Logs' },
  applicants: { ar: 'المتقدمون', en: 'Applicants' },
  refund: { ar: 'استرداد', en: 'Refund' },
  enable2fa: { ar: 'تفعيل التحقق الثنائي', en: 'Enable 2FA' },
  verify2fa: { ar: 'رمز التحقق', en: 'Verification code' },
  // Dashboard widgets
  todaysInterviews: { ar: 'مقابلات اليوم', en: "Today's Interviews" },
  newSignups: { ar: 'تسجيلات جديدة', en: 'New Signups' },
  revenueToday: { ar: 'الإيرادات اليوم', en: 'Revenue Today' },
  activeCompanies: { ar: 'الشركات النشطة', en: 'Active Companies' },
  pendingTickets: { ar: 'تذاكر الدعم المعلقة', en: 'Pending Support Tickets' },
  apiHealth: { ar: 'حالة APIs', en: 'API Health Status' },
  visitors24h: { ar: 'عدد الزوار (٢٤ ساعة)', en: 'Visitor Count (24h)' },
  revenueTrend: { ar: 'اتجاه الإيرادات', en: 'Revenue trend' },
  completionRate: { ar: 'معدل إكمال المقابلات', en: 'Interview completion rate' },
  userGrowth: { ar: 'نمو المستخدمين حسب النوع', en: 'User growth by type (B2C vs B2B)' },
  topIndustries: { ar: 'أكثر المجالات مقابلات', en: 'Top industries interviewed for' },
  // Misc ops kept for legacy routes
  legacyOps: { ar: 'عمليات إضافية', en: 'Extra Ops' },
  interviewers: { ar: 'المحاورون', en: 'Interviewers' },
  bookings: { ar: 'الحجوزات', en: 'Bookings' },
} as const satisfies Record<string, Bi>;

export type LabelKey = keyof typeof L;

export function bi(key: LabelKey): Bi {
  return L[key];
}
