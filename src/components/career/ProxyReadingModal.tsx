'use client';

import { FormEvent, ReactNode, useCallback, useState } from 'react';
import { Loader2, Sparkles, UserRound, X } from 'lucide-react';
import { CareerKeywordsResult } from '@/components/career/CareerKeywordsResult';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { CareerKeywordsReport } from '@/types/career';

interface ProxyReadingModalProps {
  isOpen: boolean;
  readingId: string;
  remainingSlots: number;
  onClose: () => void;
  onSuccess: (usedCount: number, maxCount: number) => void;
}

interface ProxyReadingResponse {
  success?: boolean;
  usedCount?: number;
  maxCount?: number;
  error?: string;
  report?: CareerKeywordsReport;
  metadata?: { friendName?: string };
}

interface ProxyFormValues {
  friendName: string;
  friendBirthDate: string;
  friendBirthTime: string;
  friendGender: 'male' | 'female';
}

const defaultValues: ProxyFormValues = {
  friendName: '',
  friendBirthDate: '',
  friendBirthTime: '12:00',
  friendGender: 'female',
};

function ModalField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">{label}</span>
      {children}
    </label>
  );
}

function FieldShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white">
      {children}
    </div>
  );
}

function ProxyForm({
  values,
  isSubmitting,
  onChange,
}: {
  values: ProxyFormValues;
  isSubmitting: boolean;
  onChange: (patch: Partial<ProxyFormValues>) => void;
}) {
  return (
    <div className="grid gap-4">
      <ModalField label="Friend Name">
        <FieldShell><input value={values.friendName} onChange={(event) => onChange({ friendName: event.target.value })} className="w-full bg-transparent outline-none" placeholder="Optional" /></FieldShell>
      </ModalField>
      <ModalField label="Birth Date">
        <FieldShell><input required type="date" max="9999-12-31" value={values.friendBirthDate} onChange={(event) => onChange({ friendBirthDate: event.target.value })} className="w-full bg-transparent outline-none" /></FieldShell>
      </ModalField>
      <div className="grid gap-4 md:grid-cols-2">
        <ModalField label="Birth Time">
          <FieldShell><input type="time" value={values.friendBirthTime} onChange={(event) => onChange({ friendBirthTime: event.target.value })} className="w-full bg-transparent outline-none" /></FieldShell>
        </ModalField>
        <ModalField label="Gender">
          <FieldShell>
            <select value={values.friendGender} onChange={(event) => onChange({ friendGender: event.target.value as 'male' | 'female' })} className="w-full bg-transparent outline-none">
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </FieldShell>
        </ModalField>
      </div>
      <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] disabled:opacity-70">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRound className="h-4 w-4" />}
        <span>Check Friend&apos;s Fate</span>
      </button>
    </div>
  );
}

function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{message}</div>;
}

function ResultShell({
  report,
  friendName,
}: {
  report: CareerKeywordsReport;
  friendName?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-50">
        Proxy reading complete. This slot is now used.
      </div>
      <CareerKeywordsResult report={report} userName={friendName} isProxy />
    </div>
  );
}

async function requestProxyReading(
  readingId: string,
  values: ProxyFormValues,
) {
  const response = await fetch('/api/career/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originReadingId: readingId, ...values }),
  });
  const payload = (await response.json()) as ProxyReadingResponse;

  if (!response.ok || !payload.success || !payload.report) {
    throw new Error(payload.error ?? 'Proxy reading failed.');
  }

  return payload;
}

export function ProxyReadingModal({
  isOpen,
  readingId,
  remainingSlots,
  onClose,
  onSuccess,
}: ProxyReadingModalProps) {
  useBodyScrollLock(isOpen);
  const [values, setValues] = useState(defaultValues);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [report, setReport] = useState<CareerKeywordsReport | null>(null);
  const [friendName, setFriendName] = useState<string | undefined>();

  const updateValues = useCallback(
    (patch: Partial<ProxyFormValues>) => setValues((current) => ({ ...current, ...patch })),
    [],
  );

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = await requestProxyReading(readingId, values);
      setReport(payload.report ?? null);
      setFriendName(payload.metadata?.friendName);
      onSuccess(payload.usedCount ?? 0, payload.maxCount ?? 3);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Proxy reading failed.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSuccess, readingId, values]);

  const resetAndClose = useCallback(() => {
    setValues(defaultValues);
    setErrorMessage(null);
    setReport(null);
    setFriendName(undefined);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;
  const isActionDisabled = isSubmitting || remainingSlots <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-md">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-white/10 bg-[#08111f] p-6 shadow-[0_40px_140px_rgba(2,6,23,0.82)]">
        <button onClick={resetAndClose} className="absolute right-5 top-5 rounded-full border border-white/10 p-2 text-white/70 transition hover:text-white"><X className="h-4 w-4" /></button>
        <div className="mb-6 space-y-3 pr-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-50/80"><Sparkles className="h-4 w-4 text-amber-200" />Proxy Reading</span>
          <h2 className="text-2xl font-semibold text-white">Use one of your 3 friend slots.</h2>
          <p className="text-sm text-white/62">Remaining slots: {remainingSlots}. The API runs a fresh career keyword read for your friend.</p>
        </div>
        <ErrorBanner message={errorMessage} />
        {remainingSlots <= 0 && !report && <ErrorBanner message="All proxy slots have been used." />}
        {report ? <ResultShell report={report} friendName={friendName} /> : <form onSubmit={handleSubmit}><ProxyForm values={values} isSubmitting={isActionDisabled} onChange={updateValues} /></form>}
      </div>
    </div>
  );
}

export default ProxyReadingModal;
