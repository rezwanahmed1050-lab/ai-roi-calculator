import { type FormEvent, type ReactNode, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Check,
  CircleDollarSign,
  Clock3,
  Gauge,
  Mail,
  Phone,
  Sparkles,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type CalculatorValues = {
  businessType: string;
  serviceName: string;
  averageValue: string;
  transactions: string;
  lifetimeMonths: string;
};

type LeadValues = {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
};

type FieldErrors = Record<string, string>;

const initialCalculator: CalculatorValues = {
  businessType: '',
  serviceName: '',
  averageValue: '',
  transactions: '',
  lifetimeMonths: '12',
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
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-0.5">
      <FieldLabel htmlFor="averageValue">Average Customer Value</FieldLabel>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono-ui text-sm font-medium text-primary">$</span>
        <input
          id="averageValue"
          data-testid="input-averageValue"
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="250"
          inputMode="decimal"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'averageValue-error' : undefined}
          className={`focus-ring h-12 w-full rounded-xl border bg-background/60 pl-9 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground/70 transition-colors hover:border-primary/50 focus:border-primary focus:bg-card focus:outline-none ${error ? 'border-destructive' : 'border-input'}`}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">What one purchase or engagement is worth.</p>
      {error ? <p id="averageValue-error" className="text-xs font-medium text-destructive">{error}</p> : null}
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

  const results = useMemo(() => {
    const averageValue = Number(calculator.averageValue) || 0;
    const transactions = Number(calculator.transactions) || 0;
    const lifetimeMonths = Number(calculator.lifetimeMonths) || 0;
    const monthly = averageValue * transactions;
    return {
      monthly,
      annual: monthly * 12,
      lifetime: monthly * lifetimeMonths,
    };
  }, [calculator]);

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
    setIsSubmitted(false);
  };

  const submitLead = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!lead.fullName.trim()) nextErrors.fullName = 'Please enter your full name.';
    if (!lead.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) nextErrors.email = 'Enter a valid email address.';
    if (!lead.phone.trim()) nextErrors.phone = 'Please enter a phone number.';
    setLeadErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    console.log('ROI analysis request submitted', {
      ...lead,
      calculator,
      projections: results,
    });
    setIsSubmitted(true);
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
        <div className="hidden items-center gap-2 text-xs font-medium text-muted-foreground sm:flex">
          <span className="size-2 rounded-full bg-secondary" />
          <span>Free growth clarity tool</span>
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

        <div className="mt-12 grid gap-8 lg:mt-20 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-14">
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
              <CurrencyField
                value={calculator.averageValue}
                onChange={(value) => updateCalculator('averageValue', value)}
                error={calculatorErrors.averageValue}
              />
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
              <div className="reveal reveal-delay-2">
                <div className="mb-7 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-mono-ui text-[10px] uppercase tracking-[0.2em] text-accent">02 / Your signal</p>
                    <h2 id="results-heading" className="mt-2 font-display text-3xl tracking-[-0.04em] text-primary sm:text-4xl">Here&apos;s the upside.</h2>
                  </div>
                  <div className="hidden rounded-full bg-secondary/30 px-3 py-1.5 text-xs font-semibold text-primary sm:block">
                    Based on your inputs
                  </div>
                </div>
                <p className="mb-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
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
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-secondary/40 bg-secondary/15 px-5 py-4 text-sm leading-relaxed text-primary">
                  <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  <p><span className="font-bold">The aha moment:</span> a small lift in loyal customers can compound into meaningful revenue. Now let&apos;s turn this snapshot into a plan.</p>
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
                <button
                  type="button"
                  data-testid="button-edit-lead"
                  onClick={() => setIsSubmitted(false)}
                  className="focus-ring mt-7 text-xs font-bold text-primary underline decoration-secondary decoration-2 underline-offset-4 transition-colors hover:text-accent"
                >
                  Update your details
                </button>
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
                  className="focus-ring group mt-7 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-secondary px-5 text-sm font-bold text-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-secondary/90 hover:shadow-[5px_5px_0_hsl(var(--accent))] active:translate-y-0"
                >
                  Send Me My ROI Analysis
                  <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
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