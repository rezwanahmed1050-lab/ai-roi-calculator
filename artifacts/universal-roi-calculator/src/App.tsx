import { type FormEvent, type ReactNode, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowRight,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Check,
  CircleDollarSign,
  Clock3,
  Download,
  FileText,
  Gauge,
  Mail,
  MailCheck,
  Phone,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Zap,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type EmailJsClient = {
  init: (publicKey: string) => void;
  send: (
    serviceId: string,
    templateId: string,
    templateParams: Record<string, string | number>,
  ) => Promise<{ status: number; text: string }>;
};

declare global {
  interface Window {
    emailjs?: EmailJsClient;
    jspdf?: {
      jsPDF: any;
    };
  }
}

const EMAILJS_SERVICE_ID = 'service_pz42fg2';
const EMAILJS_TEMPLATE_ID = 'template_il9uifj';
const EMAILJS_AUTOREPLY_TEMPLATE_ID = 'template_323r5gd';
const ROI_ANALYSIS_RECIPIENT = 'rezwanahmed1050@gmail.com';

type CalculatorValues = {
  businessType: string;
  serviceName: string;
  averageValue: string;
  transactions: string;
  lifetimeMonths: string;
  retainerFee: string;
};

type LeadValues = {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
};

type FieldErrors = Record<string, string>;

type AgencyPreset = {
  id: string;
  name: string;
  businessType: string;
  serviceName: string;
  averageValue: string;
  transactions: string;
  retainerFee: string;
  lifetimeMonths: string;
  description: string;
  icon: typeof Bot;
  accentBg: string;
};

const AGENCY_PRESETS: AgencyPreset[] = [
  {
    id: 'ai-chatbot',
    name: 'AI Support & Lead Chatbot',
    businessType: 'B2B & Local Services',
    serviceName: 'AI Conversational Assistant',
    averageValue: '1200',
    transactions: '10',
    retainerFee: '1500',
    lifetimeMonths: '12',
    description: 'Captures & qualifies web leads 24/7.',
    icon: Bot,
    accentBg: 'bg-secondary/25 text-primary',
  },
  {
    id: 'ai-ads',
    name: 'AI Paid Ads Management',
    businessType: 'E-commerce & Local Services',
    serviceName: 'AI Ad Campaigns (Meta/Google)',
    averageValue: '850',
    transactions: '20',
    retainerFee: '2500',
    lifetimeMonths: '12',
    description: 'Optimizes ad spend for maximum conversion.',
    icon: Target,
    accentBg: 'bg-accent/20 text-accent',
  },
  {
    id: 'cold-email',
    name: 'Outbound Sales Automation',
    businessType: 'B2B Agencies & SaaS',
    serviceName: 'Cold Email Lead Funnel',
    averageValue: '3500',
    transactions: '5',
    retainerFee: '3000',
    lifetimeMonths: '12',
    description: 'Automates qualified outbound meetings.',
    icon: MailCheck,
    accentBg: 'bg-primary/10 text-primary',
  },
  {
    id: 'ai-seo',
    name: 'AI SEO & Content Pipeline',
    businessType: 'High-Ticket Services & Brands',
    serviceName: 'AI Organic Growth Suite',
    averageValue: '2000',
    transactions: '8',
    retainerFee: '2000',
    lifetimeMonths: '18',
    description: 'Drives compounding organic search traffic.',
    icon: Zap,
    accentBg: 'bg-secondary/20 text-primary',
  },
];

const initialCalculator: CalculatorValues = {
  businessType: '',
  serviceName: '',
  averageValue: '',
  transactions: '',
  lifetimeMonths: '12',
  retainerFee: '',
};

const initialLead: LeadValues = {
  fullName: '',
  email: '',
  phone: '',
  companyName: '',
};

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function FieldLabel({
  htmlFor,
  children,
  optional = false,
}: {
  htmlFor: string;
  children: string;
  optional?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
      {children}
      {optional ? <span className="font-normal text-muted-foreground">(optional)</span> : <span className="text-accent">*</span>}
    </label>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  type = 'text',
  optional = false,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  icon: typeof BriefcaseBusiness;
  type?: string;
  optional?: boolean;
  inputMode?: 'text' | 'email' | 'tel' | 'decimal' | 'numeric';
}) {
  return (
    <div className="space-y-0.5">
      <FieldLabel htmlFor={id} optional={optional}>{label}</FieldLabel>
      <div className="relative">
        <Icon aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
        <input
          id={id}
          data-testid={`input-${id}`}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`focus-ring h-12 w-full rounded-xl border bg-background/60 pl-11 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground/70 transition-colors hover:border-primary/50 focus:border-primary focus:bg-card focus:outline-none ${error ? 'border-destructive' : 'border-input'}`}
        />
      </div>
      {error ? <p id={`${id}-error`} className="mt-1 text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}

function CurrencyField({
  id,
  label,
  value,
  onChange,
  placeholder = '1000',
  hint,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint: string;
  error?: string;
}) {
  return (
    <div className="space-y-0.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono-ui text-sm font-medium text-primary">$</span>
        <input
          id={id}
          data-testid={`input-${id}`}
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode="decimal"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`focus-ring h-12 w-full rounded-xl border bg-background/60 pl-9 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground/70 transition-colors hover:border-primary/50 focus:border-primary focus:bg-card focus:outline-none ${error ? 'border-destructive' : 'border-input'}`}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      {error ? <p id={`${id}-error`} className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  icon: Icon,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  hint: string;
  error?: string;
  icon: typeof Clock3;
}) {
  return (
    <div className="space-y-0.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <Icon aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
        <input
          id={id}
          data-testid={`input-${id}`}
          type="number"
          min="0"
          step="1"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode="numeric"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`focus-ring h-12 w-full rounded-xl border bg-background/60 pl-11 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground/70 transition-colors hover:border-primary/50 focus:border-primary focus:bg-card focus:outline-none ${error ? 'border-destructive' : 'border-input'}`}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      {error ? <p id={`${id}-error`} className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
  delay,
  testId,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof TrendingUp;
  accent: string;
  delay: string;
  testId: string;
}) {
  return (
    <article
      data-testid={testId}
      className="reveal rounded-2xl border border-primary/10 bg-card p-5 soft-shadow transition-transform duration-300 hover:-translate-y-1 sm:p-6"
      style={{ animationDelay: delay }}
    >
      <div className="mb-9 flex items-start justify-between gap-4">
        <div className={`flex size-11 items-center justify-center rounded-xl ${accent}`}>
          <Icon aria-hidden="true" className="size-5" />
        </div>
        <span className="font-mono-ui text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Projected</span>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-4xl tracking-[-0.04em] text-primary sm:text-[2.65rem]">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
    </article>
  );
}

function CalculatorPage() {
  const [calculator, setCalculator] = useState<CalculatorValues>(initialCalculator);
  const [calculatorErrors, setCalculatorErrors] = useState<FieldErrors>({});
  const [hasCalculated, setHasCalculated] = useState(false);
  const [lead, setLead] = useState<LeadValues>(initialLead);
  const [leadErrors, setLeadErrors] = useState<FieldErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const leadRef = useRef<HTMLElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [emailError, setEmailError] = useState('');

  const results = useMemo(() => {
    const averageValue = Number(calculator.averageValue) || 0;
    const transactions = Number(calculator.transactions) || 0;
    const lifetimeMonths = Number(calculator.lifetimeMonths) || 0;
    const retainerFee = Number(calculator.retainerFee) || 0;

    const monthly = averageValue * transactions;
    const annual = monthly * 12;
    const lifetime = monthly * lifetimeMonths;

    const breakevenSalesNeeded = averageValue > 0 ? Math.ceil(retainerFee / averageValue) : 0;
    const netMonthlyProfit = monthly - retainerFee;
    const roiMultiple = retainerFee > 0 ? (monthly / Math.max(retainerFee, 1)).toFixed(1) : '0';

    return {
      monthly,
      annual,
      lifetime,
      retainerFee,
      breakevenSalesNeeded,
      netMonthlyProfit,
      roiMultiple,
    };
  }, [calculator]);

  const applyPreset = (preset: AgencyPreset) => {
    setCalculator({
      businessType: preset.businessType,
      serviceName: preset.serviceName,
      averageValue: preset.averageValue,
      transactions: preset.transactions,
      lifetimeMonths: preset.lifetimeMonths,
      retainerFee: preset.retainerFee,
    });
    setCalculatorErrors({});
    setHasCalculated(true);
  };

  const updateCalculator = (field: keyof CalculatorValues, value: string) => {
    setCalculator((current) => ({ ...current, [field]: value }));
    setCalculatorErrors((current) => ({ ...current, [field]: '' }));
    setIsSubmitted(false);
  };

  const validateCalculator = () => {
    const nextErrors: FieldErrors = {};
    if (!calculator.businessType.trim()) nextErrors.businessType = 'Tell us what kind of business you run.';
    if (!calculator.serviceName.trim()) nextErrors.serviceName = 'Name the offer your customers buy.';
    if (!calculator.averageValue || Number(calculator.averageValue) <= 0) nextErrors.averageValue = 'Enter a value greater than $0.';
    if (!calculator.transactions || Number(calculator.transactions) <= 0) nextErrors.transactions = 'Enter at least 1 transaction.';
    if (!calculator.lifetimeMonths || Number(calculator.lifetimeMonths) <= 0) nextErrors.lifetimeMonths = 'Enter at least 1 month.';
    if (!calculator.retainerFee || Number(calculator.retainerFee) < 0) nextErrors.retainerFee = 'Enter a retainer fee.';
    setCalculatorErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const calculate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validateCalculator()) {
      setHasCalculated(true);
      window.setTimeout(() => leadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  };

  const updateLead = (field: keyof LeadValues, value: string) => {
    setLead((current) => ({ ...current, [field]: value }));
    setLeadErrors((current) => ({ ...current, [field]: '' }));
    setEmailError('');
    setIsSubmitted(false);
  };

  const generateProposalPDF = () => {
    try {
      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) {
        window.print();
        return;
      }

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const primaryColor = [28, 81, 72];
      const accentColor = [226, 106, 75];
      const lightBg = [246, 243, 235];

      // Header Banner
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('fraunces', 'bold');
      doc.setFontSize(18);
      doc.text('AI Marketing ROI & Growth Proposal', 15, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(236, 178, 55);
      doc.text('Prepared by Signal Digital AI Agency', 15, 26);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 32);

      // Client & Offer Summary Box
      doc.setFillColor(...lightBg);
      doc.roundedRect(15, 48, 180, 32, 3, 3, 'F');

      doc.setTextColor(28, 81, 72);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('PREPARED FOR:', 20, 56);
      doc.setFont('helvetica', 'normal');
      doc.text(`Client Name: ${lead.fullName.trim() || 'Valued Prospect'}`, 20, 63);
      doc.text(`Company: ${lead.companyName.trim() || 'Target Business'}`, 20, 70);

      doc.setFont('helvetica', 'bold');
      doc.text('AGENCY SERVICE:', 110, 56);
      doc.setFont('helvetica', 'normal');
      doc.text(`Offer: ${calculator.serviceName.trim() || 'AI Marketing Suite'}`, 110, 63);
      doc.text(`Target Industry: ${calculator.businessType.trim() || 'General Business'}`, 110, 70);

      // Financial Projections Table Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...primaryColor);
      doc.text('Executive Revenue Snapshot', 15, 92);

      const startY = 100;
      const rows = [
        ['Average Customer Deal Value', money.format(Number(calculator.averageValue) || 0)],
        ['Expected Monthly Deals / Clients', `${calculator.transactions || 0} deals/mo`],
        ['Projected Monthly Revenue Growth', money.format(results.monthly)],
        ['Projected Annual Revenue', money.format(results.annual)],
        ['Customer Lifetime Value (LTV)', money.format(results.lifetime)],
      ];

      doc.setFontSize(10);
      rows.forEach(([label, val], idx) => {
        const rowY = startY + idx * 10;
        doc.setFillColor(idx % 2 === 0 ? 255 : 246, idx % 2 === 0 ? 255 : 243, idx % 2 === 0 ? 255 : 235);
        doc.rect(15, rowY - 5, 180, 9, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(label, 20, rowY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(28, 81, 72);
        doc.text(val, 185, rowY, { align: 'right' });
      });

      // Agency Investment & Breakeven Analysis Box
      const boxY = 158;
      doc.setFillColor(254, 243, 199);
      doc.setDrawColor(...accentColor);
      doc.roundedRect(15, boxY, 180, 48, 4, 4, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...accentColor);
      doc.text('AGENCY RETAINER & BREAKEVEN MATH', 22, boxY + 12);

      doc.setFontSize(10);
      doc.setTextColor(28, 81, 72);
      doc.setFont('helvetica', 'normal');
      doc.text(`Monthly Agency Retainer Fee: ${money.format(results.retainerFee)}`, 22, boxY + 22);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(226, 106, 75);
      doc.text(
        `Breakeven Guarantee: Pays for itself with just ${results.breakevenSalesNeeded} deal(s) per month`,
        22,
        boxY + 30
      );

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(
        `Projected Net Monthly Profit: ${money.format(results.netMonthlyProfit)} (${results.roiMultiple}x Return on Agency Fee)`,
        22,
        boxY + 38
      );

      // Footer Call to Action
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(
        'This projection is prepared for estimation purposes based on your baseline input metrics.',
        105,
        265,
        { align: 'center' }
      );
      doc.text('Signal Digital AI Agency — Scaling Growth Through Intelligent Automation', 105, 271, {
        align: 'center',
      });

      // Save PDF
      doc.save(`AI_Marketing_ROI_Proposal_${lead.companyName.trim() || 'Client'}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF proposal:', err);
      window.print();
    }
  };

  const submitLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!lead.fullName.trim()) nextErrors.fullName = 'Please enter your full name.';
    if (!lead.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) nextErrors.email = 'Enter a valid email address.';
    if (!lead.phone.trim()) nextErrors.phone = 'Please enter a phone number.';
    setLeadErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSending(true);
    setEmailError('');

    const templateParams = {
      user_name: lead.fullName.trim(),
      user_email: lead.email.trim(),
      user_phone: lead.phone.trim(),
      user_company: lead.companyName.trim(),
      to_email: ROI_ANALYSIS_RECIPIENT,
      business_type: calculator.businessType.trim(),
      service_product_name: calculator.serviceName.trim(),
      average_customer_value: calculator.averageValue,
      transactions_per_month: calculator.transactions,
      customer_lifetime_months: calculator.lifetimeMonths,
      agency_retainer_fee: calculator.retainerFee,
      breakeven_sales_needed: results.breakevenSalesNeeded,
      net_monthly_profit: results.netMonthlyProfit,
      roi_multiple: results.roiMultiple,
      monthly_revenue_projection: results.monthly,
      annual_revenue_projection: results.annual,
      customer_lifetime_value: results.lifetime,
    };

    try {
      const sendEmail = async (templateId: string) => {
        if (typeof window.emailjs !== 'undefined' && typeof window.emailjs.send === 'function') {
          return window.emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams);
        }
        return fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_id: EMAILJS_SERVICE_ID,
            template_id: templateId,
            user_id: 'M1LcOnWVm7jfxYBF6',
            template_params: templateParams,
          }),
        });
      };

      // Dispatch Admin Notification + Customer Auto-Reply simultaneously
      await Promise.allSettled([
        sendEmail(EMAILJS_TEMPLATE_ID),
        sendEmail(EMAILJS_AUTOREPLY_TEMPLATE_ID),
        sendEmail('pzp1uu5'),
      ]);

      setIsSubmitted(true);
    } catch (error) {
      console.error('EmailJS submission notice:', error);
      setIsSubmitted(true);
    } finally {
      setIsSending(false);
    }
  };

  const businessLabel = calculator.businessType.trim() || 'your business';
  const offerLabel = calculator.serviceName.trim() || 'your offer';

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-background">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-32 top-[-10rem] size-[28rem] rounded-full bg-secondary/15 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute left-[-14rem] top-[44rem] size-[32rem] rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3" data-testid="text-brand">
          <div className="relative flex size-9 items-center justify-center rounded-[11px] bg-primary text-secondary shadow-[4px_4px_0_hsl(var(--secondary)/.3)]">
            <span className="absolute h-4 w-1.5 rounded-full bg-secondary rotate-[-26deg]" />
            <span className="absolute h-4 w-1.5 translate-x-[6px] rounded-full bg-secondary rotate-[26deg]" />
          </div>
          <span className="font-display text-xl font-semibold tracking-[-0.03em] text-primary">signal<span className="text-accent">.</span></span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={generateProposalPDF}
            className="hidden items-center gap-2 rounded-xl border border-primary/20 bg-card px-3.5 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary/5 sm:inline-flex"
          >
            <Download className="size-3.5 text-accent" />
            <span>Download Pitch PDF</span>
          </button>
          <div className="hidden items-center gap-2 text-xs font-medium text-muted-foreground md:flex">
            <span className="size-2 rounded-full bg-secondary" />
            <span>Free growth clarity tool</span>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16 lg:px-12 lg:pb-24">
        <div className="max-w-3xl reveal">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            <Sparkles aria-hidden="true" className="size-3.5 text-accent" />
            <span>Revenue, made visible</span>
          </div>
          <h1 className="max-w-4xl font-display text-[3.5rem] leading-[.96] tracking-[-0.065em] text-primary sm:text-7xl lg:text-[6.7rem]">
            Know what your<br />
            <span className="relative inline-block text-accent">
              best customers
              <span className="absolute -bottom-1 left-0 h-2 w-full -rotate-1 rounded-full bg-secondary/70 sm:-bottom-2 sm:h-3" aria-hidden="true" />
            </span>{' '}
            are worth.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Put a few plain-English numbers to work. Get an instant picture of the revenue hiding inside your next customer.
          </p>
        </div>

        {/* Warm Editorial Agency Offer Presets */}
        <div className="mt-10 reveal">
          <p className="mb-3 font-mono-ui text-[10px] uppercase tracking-[0.2em] text-accent">Select Agency Offer Preset</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {AGENCY_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = calculator.serviceName === preset.serviceName;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`group flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                    isSelected
                      ? 'border-primary bg-card ring-2 ring-secondary/50 shadow-md'
                      : 'border-primary/15 bg-card/80 hover:border-primary/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex size-9 items-center justify-center rounded-xl ${preset.accentBg}`}>
                        <Icon className="size-4" />
                      </div>
                      <span className="font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">${preset.retainerFee}/mo</span>
                    </div>
                    <p className="font-display text-base font-semibold tracking-tight text-primary group-hover:text-accent transition-colors">
                      {preset.name}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{preset.description}</p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-primary/10 flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground font-mono-ui text-[11px]">{preset.businessType}</span>
                    <span className="text-accent group-hover:translate-x-0.5 transition-transform">Apply →</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-14">
          <section className="reveal reveal-delay-1 rounded-[1.75rem] border border-primary/15 bg-card/90 p-6 soft-shadow sm:p-8" aria-labelledby="calculator-heading">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono-ui text-[10px] uppercase tracking-[0.2em] text-accent">01 / Your economics</p>
                <h2 id="calculator-heading" className="mt-2 font-display text-3xl tracking-[-0.04em] text-primary">Start with what you know.</h2>
              </div>
              <div className="hidden size-11 items-center justify-center rounded-full bg-secondary/25 text-primary sm:flex">
                <Calculator aria-hidden="true" className="size-5" />
              </div>
            </div>
            <form onSubmit={calculate} noValidate className="space-y-5">
              <TextField
                id="businessType"
                label="Business Type"
                value={calculator.businessType}
                onChange={(value) => updateCalculator('businessType', value)}
                placeholder="e.g. Boutique fitness studio"
                error={calculatorErrors.businessType}
                icon={BriefcaseBusiness}
              />
              <TextField
                id="serviceName"
                label="Service / Product Name"
                value={calculator.serviceName}
                onChange={(value) => updateCalculator('serviceName', value)}
                placeholder="e.g. 12-week coaching program"
                error={calculatorErrors.serviceName}
                icon={Gauge}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <CurrencyField
                  id="averageValue"
                  label="Average Customer Value"
                  value={calculator.averageValue}
                  onChange={(value) => updateCalculator('averageValue', value)}
                  hint="What 1 engagement is worth."
                  error={calculatorErrors.averageValue}
                />
                <CurrencyField
                  id="retainerFee"
                  label="Monthly Agency Retainer"
                  value={calculator.retainerFee}
                  onChange={(value) => updateCalculator('retainerFee', value)}
                  hint="Your monthly service fee."
                  error={calculatorErrors.retainerFee}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <NumberField
                  id="transactions"
                  label="Transactions per Month"
                  value={calculator.transactions}
                  onChange={(value) => updateCalculator('transactions', value)}
                  placeholder="18"
                  hint="A realistic monthly average."
                  error={calculatorErrors.transactions}
                  icon={BarChart3}
                />
                <NumberField
                  id="lifetimeMonths"
                  label="Customer Lifetime"
                  value={calculator.lifetimeMonths}
                  onChange={(value) => updateCalculator('lifetimeMonths', value)}
                  placeholder="12"
                  hint="Months a customer stays."
                  error={calculatorErrors.lifetimeMonths}
                  icon={Clock3}
                />
              </div>
              <button
                type="submit"
                data-testid="button-calculate"
                className="focus-ring group mt-3 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[5px_5px_0_hsl(var(--secondary))] active:translate-y-0"
              >
                See my revenue projection
                <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <p className="text-center text-xs text-muted-foreground">No sign-up required. Your numbers stay in this browser.</p>
            </form>
          </section>

          <section className="min-w-0" aria-labelledby="results-heading">
            {hasCalculated ? (
              <div className="reveal reveal-delay-2 space-y-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-mono-ui text-[10px] uppercase tracking-[0.2em] text-accent">02 / Your signal</p>
                    <h2 id="results-heading" className="mt-2 font-display text-3xl tracking-[-0.04em] text-primary sm:text-4xl">Here&apos;s the upside.</h2>
                  </div>
                  <button
                    type="button"
                    onClick={generateProposalPDF}
                    className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold text-primary shadow-sm hover:bg-secondary/90 transition-all hover:-translate-y-0.5"
                  >
                    <FileText className="size-4" />
                    <span>Download Pitch PDF</span>
                  </button>
                </div>
                <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                  If <span className="font-semibold text-foreground">{businessLabel}</span> brings in <span className="font-semibold text-foreground">{calculator.transactions} customers</span> each month for <span className="font-semibold text-foreground">{offerLabel}</span>, your modeled value looks like this:
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard
                    testId="metric-monthly-revenue"
                    label="Monthly Revenue"
                    value={money.format(results.monthly)}
                    detail="The monthly rhythm your current model can create."
                    icon={TrendingUp}
                    accent="bg-secondary/25 text-primary"
                    delay="120ms"
                  />
                  <StatCard
                    testId="metric-annual-revenue"
                    label="Annual Revenue"
                    value={money.format(results.annual)}
                    detail="Your monthly projection, carried across a full year."
                    icon={BarChart3}
                    accent="bg-accent/20 text-accent"
                    delay="210ms"
                  />
                  <StatCard
                    testId="metric-lifetime-value"
                    label="Customer Lifetime Value"
                    value={money.format(results.lifetime)}
                    detail="What a customer is worth over their full relationship."
                    icon={CircleDollarSign}
                    accent="bg-primary/10 text-primary"
                    delay="300ms"
                  />
                </div>

                {/* Warm Editorial Sales Pitch Breakeven Guarantee Card */}
                <div className="rounded-2xl border border-secondary/40 bg-secondary/15 p-6 soft-shadow">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="size-4 text-accent" />
                    <span>Sales Pitch Breakeven Guarantee</span>
                  </div>
                  <h3 className="mt-2 font-display text-3xl tracking-[-0.03em] text-primary">
                    Pays for itself with just <span className="text-accent underline font-bold">{results.breakevenSalesNeeded} deal(s)</span> per month.
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    At a <span className="font-semibold text-foreground">${calculator.averageValue}</span> customer value, closing just <span className="font-bold text-foreground">{results.breakevenSalesNeeded} extra deal(s)</span> completely covers your <span className="font-semibold text-foreground">${calculator.retainerFee}/mo</span> agency fee.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl bg-card p-4 border border-primary/10">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Net Monthly Profit</p>
                      <p className="text-2xl font-bold font-display text-primary">{money.format(results.netMonthlyProfit)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">ROI Multiple on Retainer</p>
                      <p className="text-2xl font-bold font-display text-accent">{results.roiMultiple}x Return</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-secondary/40 bg-secondary/15 px-5 py-4 text-sm leading-relaxed text-primary">
                  <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
                  <p><span className="font-bold">Pitch Tip:</span> Showing prospects that closing just {results.breakevenSalesNeeded} client pays your entire fee removes buying hesitation immediately.</p>
                </div>
              </div>
            ) : (
              <div className="reveal reveal-delay-2 flex min-h-[26rem] flex-col justify-between rounded-[1.75rem] border border-dashed border-primary/25 bg-primary/[.035] p-7 sm:p-9">
                <div>
                  <p className="font-mono-ui text-[10px] uppercase tracking-[0.2em] text-accent">02 / Your signal</p>
                  <h2 id="results-heading" className="mt-3 max-w-md font-display text-4xl leading-tight tracking-[-0.05em] text-primary">Your clearest growth lever is one calculation away.</h2>
                  <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">We&apos;ll translate your everyday economics into three numbers you can actually use to make decisions.</p>
                </div>
                <div className="mt-12 grid max-w-lg grid-cols-3 gap-3" aria-label="Metrics waiting to be calculated">
                  {['Monthly', 'Annual', 'Lifetime'].map((label, index) => (
                    <div key={label} data-testid={`empty-metric-${index}`} className="rounded-xl border border-primary/10 bg-card/55 p-3 sm:p-4">
                      <div className="mb-6 h-2 w-1/2 rounded-full bg-muted" />
                      <div className="h-6 w-4/5 rounded-md bg-muted/70" />
                      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </section>

      <section ref={leadRef} className={`relative z-10 border-y border-primary/10 bg-primary px-5 py-16 text-primary-foreground sm:px-8 sm:py-20 lg:px-12 ${hasCalculated ? 'block' : 'hidden'}`} aria-labelledby="lead-heading">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-20">
          <div className="max-w-xl">
            <p className="font-mono-ui text-[10px] uppercase tracking-[0.2em] text-secondary">03 / Make it actionable</p>
            <h2 id="lead-heading" className="mt-4 font-display text-4xl leading-[1.03] tracking-[-0.05em] sm:text-5xl">Get a detailed ROI analysis sent to your email</h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-primary-foreground/70">
              Receive a personalized breakdown of your projections, plus the few levers most likely to move the needle for your business.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs text-primary-foreground/70">
              <span className="inline-flex items-center gap-2"><Check aria-hidden="true" className="size-3.5 text-secondary" />Personalized to you</span>
              <span className="inline-flex items-center gap-2"><Check aria-hidden="true" className="size-3.5 text-secondary" />No spam, ever</span>
            </div>
          </div>

          <form onSubmit={submitLead} noValidate className="rounded-[1.5rem] bg-card p-6 text-foreground soft-shadow sm:p-8">
            {isSubmitted ? (
              <div data-testid="status-lead-success" className="flex min-h-[19rem] flex-col items-center justify-center text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
                  <Check aria-hidden="true" className="size-8" />
                </div>
                <h3 className="mt-6 font-display text-3xl tracking-[-0.04em] text-primary">You&apos;re all set.</h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">Check your email for your personalized ROI breakdown</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={generateProposalPDF}
                    className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold text-primary shadow-sm hover:bg-secondary/90"
                  >
                    <Download className="size-4" />
                    <span>Download Proposal PDF</span>
                  </button>
                  <button
                    type="button"
                    data-testid="button-edit-lead"
                    onClick={() => setIsSubmitted(false)}
                    className="focus-ring text-xs font-bold text-primary underline decoration-secondary decoration-2 underline-offset-4 transition-colors hover:text-accent self-center px-2"
                  >
                    Update your details
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    id="fullName"
                    label="Full Name"
                    value={lead.fullName}
                    onChange={(value) => updateLead('fullName', value)}
                    placeholder="Alex Morgan"
                    error={leadErrors.fullName}
                    icon={UserRound}
                  />
                  <TextField
                    id="email"
                    label="Email"
                    value={lead.email}
                    onChange={(value) => updateLead('email', value)}
                    placeholder="alex@company.com"
                    error={leadErrors.email}
                    icon={Mail}
                    type="email"
                    inputMode="email"
                  />
                  <TextField
                    id="phone"
                    label="Phone"
                    value={lead.phone}
                    onChange={(value) => updateLead('phone', value)}
                    placeholder="(415) 555-0138"
                    error={leadErrors.phone}
                    icon={Phone}
                    type="tel"
                    inputMode="tel"
                  />
                  <TextField
                    id="companyName"
                    label="Company Name"
                    value={lead.companyName}
                    onChange={(value) => updateLead('companyName', value)}
                    placeholder="Your company"
                    error={leadErrors.companyName}
                    icon={Building2}
                    optional
                  />
                </div>
                <button
                  type="submit"
                  data-testid="button-submit-lead"
                  disabled={isSending}
                  aria-busy={isSending}
                  className="focus-ring group mt-7 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-secondary px-5 text-sm font-bold text-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-secondary/90 hover:shadow-[5px_5px_0_hsl(var(--accent))] active:translate-y-0 disabled:cursor-wait disabled:opacity-70"
                >
                  {isSending ? 'Sending…' : 'Send Me My ROI Proposal'}
                  <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                {emailError ? <p role="alert" className="mt-3 text-center text-xs font-medium text-destructive">{emailError}</p> : null}
                <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">By requesting your analysis, you agree to hear from Signal Digital about your results.</p>
              </>
            )}
          </form>
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-8 text-center text-xs text-muted-foreground sm:flex-row sm:px-8 sm:text-left lg:px-12">
        <p data-testid="text-footer">Powered by Signal Digital | Free ROI Calculator</p>
        <p className="font-mono-ui text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">Clarity compounds</p>
      </footer>
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={CalculatorPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;