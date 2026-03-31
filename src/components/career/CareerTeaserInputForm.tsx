'use client';

import { FormEvent, useCallback, useState } from 'react';
import { ArrowRight, Briefcase, Clock3, Sparkles, VenusAndMars } from 'lucide-react';
import {
  CAREER_WORRY_OPTIONS,
  CareerInputValues,
  CareerWorryType,
} from '@/types/career';

interface CareerTeaserInputFormProps {
  isSubmitting: boolean;
  onSubmit: (values: CareerInputValues) => Promise<void>;
}

const defaultValues: CareerInputValues = {
  birthDate: '',
  birthTime: '12:00',
  gender: 'female',
  worryType: 'transition',
};

interface GenderButtonProps {
  value: 'male' | 'female';
  label: string;
  currentValue: 'male' | 'female';
  onSelect: (value: 'male' | 'female') => void;
}

interface SectionLabelProps {
  icon: typeof Sparkles;
  text: string;
}

interface TextFieldProps {
  label: string;
  type: 'date' | 'time';
  value: string;
  onChange: (value: string) => void;
}

interface WorrySelectProps {
  value: CareerWorryType;
  onChange: (value: CareerWorryType) => void;
}

function SectionLabel({ icon: Icon, text }: SectionLabelProps) {
  return (
    <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">
      <Icon className="h-4 w-4 text-amber-300" />
      <span>{text}</span>
    </label>
  );
}

function TextField({ label, type, value, onChange }: TextFieldProps) {
  const Icon = type === 'date' ? Sparkles : Clock3;

  return (
    <div>
      <SectionLabel icon={Icon} text={label} />
      <input
        required
        type={type}
        value={value}
        max={type === 'date' ? '9999-12-31' : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/50 focus:bg-slate-950/90"
      />
    </div>
  );
}

function GenderButton({
  value,
  label,
  currentValue,
  onSelect,
}: GenderButtonProps) {
  const isActive = currentValue === value;
  const activeStyle = isActive ? 'border-cyan-300/70 bg-cyan-300/15 text-white' : 'border-white/10 bg-white/5 text-white/70';

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${activeStyle}`}
    >
      {label}
    </button>
  );
}

function GenderField({
  value,
  onChange,
}: {
  value: 'male' | 'female';
  onChange: (value: 'male' | 'female') => void;
}) {
  return (
    <div>
      <SectionLabel icon={VenusAndMars} text="Gender" />
      <div className="grid grid-cols-2 gap-3">
        <GenderButton value="female" label="Female" currentValue={value} onSelect={onChange} />
        <GenderButton value="male" label="Male" currentValue={value} onSelect={onChange} />
      </div>
    </div>
  );
}

function WorrySelect({ value, onChange }: WorrySelectProps) {
  return (
    <div>
      <SectionLabel icon={Briefcase} text="Current Crossroad" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as CareerWorryType)}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/50 focus:bg-slate-950/90"
      >
        {CAREER_WORRY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FormHint() {
  return (
    <div className="rounded-2xl border border-amber-300/20 bg-amber-200/10 p-4 text-sm text-amber-50/80">
      Teaser mode reveals your strongest career signal first, then opens the full result page.
    </div>
  );
}

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  const label = isSubmitting ? 'Consulting the orbit...' : 'Reveal My Career Oracle';

  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-200 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <span>{label}</span>
      {!isSubmitting && <ArrowRight className="h-4 w-4" />}
    </button>
  );
}

export function CareerTeaserInputForm({
  isSubmitting,
  onSubmit,
}: CareerTeaserInputFormProps) {
  const [formValues, setFormValues] = useState(defaultValues);

  const updateValues = useCallback(
    (patch: Partial<CareerInputValues>) => setFormValues((current) => ({ ...current, ...patch })),
    [],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await onSubmit(formValues);
    },
    [formValues, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormHint />
      <TextField label="Birth Date" type="date" value={formValues.birthDate} onChange={(birthDate) => updateValues({ birthDate })} />
      <TextField label="Birth Time" type="time" value={formValues.birthTime} onChange={(birthTime) => updateValues({ birthTime })} />
      <GenderField value={formValues.gender} onChange={(gender) => updateValues({ gender })} />
      <WorrySelect value={formValues.worryType} onChange={(worryType) => updateValues({ worryType })} />
      <SubmitButton isSubmitting={isSubmitting} />
    </form>
  );
}
