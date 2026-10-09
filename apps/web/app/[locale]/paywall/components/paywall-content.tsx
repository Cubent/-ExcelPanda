'use client';

import {
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { sendGAEvent } from '@repo/analytics';
import { getGaClientId } from '../../../../lib/ga4-client-id';
import { META_PLAN_KEY, META_PLAN_VALUE, trackMeta } from '../../../../lib/meta-pixel';
import { trackEvent } from '../../../../lib/umami';

type PlanId = 'monthly' | 'quarterly' | 'yearly';

type Plan = {
  id: PlanId;
  label: string;
  perMonth: string;
  billedLine: string;
  badges: { text: string; tone: 'primary' | 'savings' | 'neutral' }[];
};

const PLANS: Plan[] = [
  {
    id: 'monthly',
    label: 'Monthly',
    perMonth: '$80',
    billedLine: 'Billed $80 monthly',
    badges: [{ text: 'Most popular', tone: 'primary' }],
  },
  {
    id: 'quarterly',
    label: '3 months',
    perMonth: '$43.33',
    billedLine: 'Billed $130 every 3 months',
    badges: [{ text: 'Save 46%', tone: 'savings' }],
  },
  {
    id: 'yearly',
    label: 'Yearly',
    perMonth: '$33.33',
    billedLine: 'Billed $400 yearly',
    badges: [
      { text: 'Best value', tone: 'primary' },
      { text: 'Save 58%', tone: 'savings' },
    ],
  },
];

const FEATURES = [
  { icon: Sparkles, text: 'Adaptive question sets' },
  { icon: RefreshCw, text: 'Spaced repetition built in' },
  { icon: ShieldCheck, text: 'Physician-reviewed explanations' },
];

const Badge = ({ text, tone }: { text: string; tone: 'primary' | 'savings' | 'neutral' }) => (
  <span
    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
      tone === 'primary'
        ? 'bg-[#C46B10]/15 text-[#C46B10]'
        : tone === 'savings'
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-gray-100 text-gray-600'
    }`}
  >
    {text}
  </span>
);

// Placeholder testimonial content — NOT real student reviews. Replace with
// actual quotes/names (or first-name + exam only, for privacy) before this
// ships publicly. Photos are stock Unsplash portraits standing in for real
// student photos — pairing an actual person's photo with a quote they never
// said is a textbook deceptive-testimonial pattern, so these must be swapped
// for real student photos (with consent) before this ships publicly.
type Testimonial = { quote: string; body: string; name: string; photo: string; role: string };

const unsplashPortrait = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?w=128&h=128&fit=crop&crop=faces&auto=format&q=80`;

const TESTIMONIAL_PAGES: Testimonial[][] = [
  [
    {
      quote: 'Finally felt like the bank knew what I needed',
      body: 'The weak-area follow-up questions made review actually useful instead of just re-reading the same explanations.',
      name: 'Sarah Chen',
      photo: unsplashPortrait('photo-1494790108377-be9c29b29330'),
      role: 'STEP 1 student',
    },
    {
      quote: 'Kept me on pace all semester',
      body: 'I stopped falling behind on review because it just showed up automatically instead of me having to plan it myself.',
      name: 'Marcus Bell',
      photo: unsplashPortrait('photo-1500648767791-00dcc994a43e'),
      role: 'STEP 2 CK student',
    },
    {
      quote: 'The explanations are what sold me',
      body: 'They read like something a physician actually wrote, not a generic summary pulled from a textbook.',
      name: 'Priya Patel',
      photo: unsplashPortrait('photo-1489424731084-a5d8b219a5bb'),
      role: 'STEP 3 candidate',
    },
  ],
  [
    {
      quote: 'Picked up right where I left off',
      body: 'Switching from Step 3 to ABIM prep, it already knew what I was weak on instead of starting from zero.',
      name: 'David Okafor',
      photo: unsplashPortrait('photo-1472099645785-5658abf4ff4e'),
      role: 'ABIM candidate',
    },
    {
      quote: 'Dedicated period felt manageable',
      body: 'The reserve set for weak areas meant I wasn’t just grinding random questions in the last few weeks.',
      name: 'Rachel Kim',
      photo: unsplashPortrait('photo-1544005313-94ddf0286df2'),
      role: 'STEP 2 CK student',
    },
    {
      quote: 'Questions actually connect',
      body: 'Working through a case-style thread instead of jumping topics made things stick better than flashcards ever did.',
      name: 'James Whitfield',
      photo: unsplashPortrait('photo-1507003211169-0a1dd7228f2d'),
      role: 'STEP 1 student',
    },
  ],
];

// The day-7 date is computed from "now", not hardcoded, so it's always
// accurate regardless of when someone lands on this page.
const TrialTimeline = () => {
  const dayZero = new Date();
  const conversionDate = new Date(dayZero);
  conversionDate.setDate(conversionDate.getDate() + 7);
  const conversionLabel = conversionDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  const steps = [
    {
      number: '01',
      title: 'Today — full access',
      body: 'Every adaptive set, review schedule, and explanation unlocks now. No charge today.',
    },
    {
      number: '02',
      title: 'Before day 7 — a reminder',
      body: 'We email you before the trial converts, so you stay in control of your subscription.',
    },
    {
      number: '03',
      title: 'Day 7 — plan begins',
      body: `Your selected plan starts on ${conversionLabel}. Cancel anytime before then and pay nothing.`,
    },
  ];

  return (
    <div className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
        How the trial works
      </p>
      <div className="mt-5 flex flex-col">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <div key={step.number} className="relative flex items-start gap-4 pb-8 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute left-[18px] top-9 h-[calc(100%-2.25rem)] w-px bg-gradient-to-b from-[#06005A]/25 to-[#06005A]/5"
                />
              )}
              <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-[#06005A]/10 text-sm font-bold text-[#06005A] ring-4 ring-white">
                {step.number}
              </span>
              <div className="min-w-0 pt-1">
                <h3 className="text-base font-semibold text-black">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{step.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  const [page, setPage] = useState(0);
  const totalPages = TESTIMONIAL_PAGES.length;

  return (
    <div className="mt-16 border-t border-gray-100 pt-12">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
        What students say
      </p>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-gray-500">
        Placeholder testimonials shown here for layout — swap in real student reviews before
        launch.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {TESTIMONIAL_PAGES[page].map((t) => (
          <div key={t.quote} className="rounded-2xl border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-black">&quot;{t.quote}&quot;</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{t.body}</p>
            <div className="mt-4 flex items-center gap-2.5">
              <img
                src={t.photo}
                alt=""
                className="size-9 shrink-0 rounded-full bg-gray-100 object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-black">{t.name}</p>
                <p className="truncate text-xs font-medium text-gray-500">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
            aria-label="Previous testimonials"
            className="flex size-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {TESTIMONIAL_PAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                aria-label={`Go to testimonial page ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === page ? 'w-6 bg-[#C46B10]' : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPage((p) => (p + 1) % totalPages)}
            aria-label="Next testimonials"
            className="flex size-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
};

const FAQS_WITH_TRIAL = [
  {
    question: 'Will I be charged today?',
    answer:
      'No. Starting the trial unlocks full access immediately and your card isn’t charged until the trial ends on day 7.',
  },
  {
    question: 'How do I cancel?',
    answer:
      'Cancel anytime from your account settings before day 7. It takes one click and there’s no retention flow to fight through. Once canceled, you won’t be charged.',
  },
  {
    question: 'What happens when the trial ends?',
    answer:
      'If you don’t cancel, your selected plan starts automatically and you’re billed at the rate shown for that plan. We email you a reminder before that happens.',
  },
  {
    question: 'Can I switch plans later?',
    answer:
      'Yes. You can move between monthly, 3-month, and yearly plans at any time from your account settings, and changes apply at your next billing cycle.',
  },
  {
    question: 'What do I get access to during the trial?',
    answer:
      'Everything: the full adaptive question bank, spaced-repetition review schedule, and physician-reviewed explanations. Nothing is held back for paying users only.',
  },
];

const FAQS_NO_TRIAL = [
  {
    question: 'Will I be charged today?',
    answer: 'Yes. Your card is charged for the plan you select as soon as checkout completes.',
  },
  {
    question: 'How do I cancel?',
    answer:
      'Cancel anytime from your account settings. It takes one click and there’s no retention flow to fight through. You keep access through the end of your current billing period.',
  },
  {
    question: 'Can I switch plans later?',
    answer:
      'Yes. You can move between monthly, 3-month, and yearly plans at any time from your account settings, and changes apply at your next billing cycle.',
  },
  {
    question: 'What do I get access to?',
    answer:
      'Everything: the full adaptive question bank, spaced-repetition review schedule, and physician-reviewed explanations.',
  },
];

const FaqSection = ({ withTrial }: { withTrial: boolean }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const FAQS = withTrial ? FAQS_WITH_TRIAL : FAQS_NO_TRIAL;

  return (
    <div className="mt-20 border-t border-gray-100 pt-14 sm:pt-16">
      <div className="grid gap-10 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C46B10]">FAQ</p>
          <h2 className="font-[family-name:var(--font-display)] mt-3 text-2xl font-bold tracking-tight text-black sm:text-[2rem]">
            Questions, answered.
          </h2>
        </div>

        <div className="divide-y divide-gray-100 border-t border-gray-100 sm:border-t-0">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={faq.question} className="py-1">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-start justify-between gap-6 py-4 text-left"
                >
                  <span className="flex items-baseline gap-4">
                    <span className="font-[family-name:var(--font-display)] text-xs font-semibold text-gray-300">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`text-[15px] font-semibold transition-colors ${
                        isOpen ? 'text-black' : 'text-gray-800 group-hover:text-black'
                      }`}
                    >
                      {faq.question}
                    </span>
                  </span>
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                      isOpen
                        ? 'rotate-45 border-[#C46B10] bg-[#C46B10] text-white'
                        : 'border-gray-300 text-gray-500 group-hover:border-gray-400'
                    }`}
                  >
                    <Plus className="size-3.5" strokeWidth={2.5} />
                  </span>
                </button>

                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-lg pb-5 pl-[2.1rem] text-sm leading-relaxed text-gray-600">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const PaywallContent = ({ withTrial }: { withTrial: boolean }) => {
  const [selected, setSelected] = useState<PlanId>('monthly');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = PLANS.find((p) => p.id === selected)!;

  const startCheckout = async () => {
    setIsRedirecting(true);
    setError(null);
    // One event name per plan (start-trial-monthly / -quarterly / -yearly), so the plans
    // show up as separate rows in Umami. The button itself is data-umami-ignore so the
    // generic click tracker does not log a second, plan-less event for the same click.
    trackEvent(`start-trial-${selected}`, { plan: selected, value: META_PLAN_VALUE[selected] });
    trackMeta('InitiateCheckout', {
      value: META_PLAN_VALUE[selected],
      currency: 'USD',
      content_name: `${plan.label} plan`,
    });
    // GA4's begin_checkout, so Google Ads can import it as the "Inizio
    // procedura di pagamento" conversion goal. The real Purchase event fires
    // server-side from the Stripe webhook, days later when the trial
    // converts. See sendGA4Purchase.
    sendGAEvent('event', 'begin_checkout', {
      currency: 'USD',
      value: META_PLAN_VALUE[selected],
      items: [{ item_name: `${plan.label} plan` }],
    });
    const gaClientId = getGaClientId();
    try {
      window.sessionStorage.setItem(META_PLAN_KEY, selected);
    } catch {
      // Storage blocked: the trial event just goes out without a plan value.
    }
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selected, withTrial, gaClientId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.url) {
        setError(data.error ?? 'Could not start checkout. Please try again.');
        setIsRedirecting(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError('Could not start checkout. Check your connection and try again.');
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-3xl items-center gap-2.5 px-6 pt-8">
        <img
          src="/animateos-logo (1).png"
          alt="MedPrep Institute Logo"
          className="h-7 w-7 rounded-md object-cover"
        />
        <span className="text-base font-medium text-[#06005A]">MedPrep Institute</span>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
          {withTrial ? 'Almost there' : 'Pick your plan'}
        </p>
        <h1 className="font-[family-name:var(--font-display)] mt-3 text-3xl font-bold tracking-tight text-black sm:text-4xl">
          {withTrial ? 'Start your 7-day free trial.' : 'Choose your plan.'}
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          {withTrial
            ? 'Full access to every adaptive set, review, and explanation, free for 7 days.'
            : 'Full access to every adaptive set, review, and explanation.'}
        </p>
        <p className="mt-1 text-sm font-medium text-emerald-700">
          {withTrial ? 'No risk. Cancel anytime.' : 'Cancel anytime.'}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {PLANS.map((p) => {
            const isSelected = p.id === selected;
            return (
              <button
                key={p.id}
                type="button"
                data-track={`plan-${p.id}`}
                onClick={() => setSelected(p.id)}
                className={`rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  isSelected
                    ? 'border-[#C46B10] bg-[#C46B10]/5'
                    : 'border-transparent bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-[#000C3F]">{p.label}</h3>
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected ? 'border-[#C46B10] bg-[#C46B10]' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <Check className="size-3 text-white" strokeWidth={3} />}
                  </span>
                </div>

                <p className="mt-3 text-2xl font-bold text-[#000C3F]">
                  {p.perMonth}
                  <span className="text-sm font-medium text-gray-500">/mo</span>
                </p>
                <p className="mt-1 text-xs text-gray-500">{p.billedLine}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.badges.map((badge) => (
                    <Badge key={badge.text} text={badge.text} tone={badge.tone} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
        )}

        <button
          type="button"
          onClick={startCheckout}
          data-umami-ignore
          disabled={isRedirecting}
          className="mt-6 w-full rounded-full bg-[#C46B10] px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#a95a0d] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isRedirecting ? 'Redirecting…' : withTrial ? 'Start my free trial' : 'Continue to checkout'}
        </button>

        <div className="mt-6 rounded-2xl bg-gray-100 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
            {withTrial ? 'Your trial' : 'Your plan'}
          </p>
          <p className="mt-2 text-xl font-bold text-black">
            {withTrial ? `7 days free, then ${plan.perMonth}/mo` : `${plan.perMonth}/mo`}
          </p>
          <p className="mt-1 text-sm text-gray-600">{plan.billedLine} &middot; Cancel anytime</p>

          <div className="mt-5 flex flex-col gap-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[#06005A]">
                  <Icon className="size-3.5" />
                </span>
                <span className="text-sm text-gray-700">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {withTrial && <TrialTimeline />}

        <TestimonialsSection />

        <FaqSection withTrial={withTrial} />
      </div>
    </div>
  );
};
