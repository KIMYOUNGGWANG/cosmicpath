'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { Calendar, Clock3, Sparkles, User2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CAREER_WORRY_OPTIONS, CareerWorryType } from '@/types/career';

type Gender = 'male' | 'female';
type CalendarType = 'solar' | 'lunar';
type CareerInputMode = 'self' | 'proxy';

export interface ReadingData {
  name: string;
  gender: Gender;
  birthDate: string;
  birthTime: string;
  calendarType: CalendarType;
  worryType?: CareerWorryType;
  question?: string;
  mode: CareerInputMode;
}

export interface CareerReadingData extends ReadingData {
  friendName?: string;
  friendGender?: Gender;
  friendBirthDate?: string;
  friendBirthTime?: string;
}

interface CareerInputFormProps {
  onSubmit: (data: CareerReadingData) => void;
  mode?: CareerInputMode;
  isLoading?: boolean;
  isSubmitting?: boolean;
  className?: string;
}

interface CareerInputState {
  name: string;
  gender: Gender;
  birthDate: string;
  birthTime: string;
  calendarType: CalendarType;
  worryType: CareerWorryType;
  question: string;
}

const INITIAL_FORM_STATE: CareerInputState = {
  name: '',
  gender: 'male',
  birthDate: '',
  birthTime: '12:00',
  calendarType: 'solar',
  worryType: 'transition',
  question: '',
};

function getFieldClassName() {
  return 'w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-amber-200/50';
}

function formatBirthDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length < 5) return digits;
  if (digits.length < 7) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function formatBirthTime(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isFormReady(state: CareerInputState, mode: CareerInputMode) {
  if (!state.name.trim()) return false;
  if (state.birthDate.length !== 10 || state.birthTime.length !== 5) return false;
  return mode === 'proxy' || Boolean(state.question.trim());
}

function buildSubmissionData(state: CareerInputState, mode: CareerInputMode) {
  return {
    name: state.name.trim(),
    gender: state.gender,
    birthDate: state.birthDate,
    birthTime: state.birthTime,
    calendarType: state.calendarType,
    worryType: state.worryType,
    question: mode === 'self' ? state.question.trim() : undefined,
    friendName: mode === 'proxy' ? state.name.trim() : undefined,
    friendGender: mode === 'proxy' ? state.gender : undefined,
    friendBirthDate: mode === 'proxy' ? state.birthDate : undefined,
    friendBirthTime: mode === 'proxy' ? state.birthTime : undefined,
    mode,
  };
}

function FormBadge({ mode }: { mode: CareerInputMode }) {
  return <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-amber-100"><Sparkles className="h-3.5 w-3.5" />{mode === 'proxy' ? 'Proxy Career Read' : 'Career Oracle Intake'}</div>;
}

function FormHeader({ mode }: { mode: CareerInputMode }) {
  const title = mode === 'proxy' ? '친구의 커리어 성향을 읽어보세요' : '당신의 커리어 궤도를 정밀하게 입력하세요';
  const description = mode === 'proxy' ? '친구의 생년월일시를 입력하면 선물용 커리어 키워드를 생성합니다.' : '생년월일시와 질문을 함께 받아 더 밀도 높은 커리어 리딩을 생성합니다.';
  return <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-md"><FormBadge mode={mode} /><div><h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2><p className="mt-3 text-sm leading-6 text-white/60">{description}</p></div></div>;
}

function SectionLabel(props: { icon: typeof User2; label: string }) {
  return <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/45"><props.icon className="h-4 w-4 text-amber-100/80" />{props.label}</div>;
}

function GenderButtons(props: { value: Gender; onChange: (value: Gender) => void }) {
  return <div className="grid grid-cols-2 gap-2">{(['male', 'female'] as const).map((value) => <button key={value} type="button" onClick={() => props.onChange(value)} className={cn('rounded-2xl border px-4 py-3 text-sm transition', props.value === value ? 'border-amber-200/50 bg-amber-200/10 text-white' : 'border-white/10 bg-white/[0.03] text-white/55 hover:text-white')}>{value === 'male' ? '남성' : '여성'}</button>)}</div>;
}

export function CareerInputForm({ onSubmit, mode = 'self', isLoading = false, isSubmitting = false, className }: CareerInputFormProps) {
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const isBusy = isLoading || isSubmitting;
  const updateField = <FieldName extends keyof CareerInputState>(fieldName: FieldName, value: CareerInputState[FieldName]) => setFormState((current) => ({ ...current, [fieldName]: value }));
  const handleBirthDateChange = (event: ChangeEvent<HTMLInputElement>) => updateField('birthDate', formatBirthDate(event.target.value));
  const handleBirthTimeChange = (event: ChangeEvent<HTMLInputElement>) => updateField('birthTime', formatBirthTime(event.target.value));
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!isFormReady(formState, mode)) return; onSubmit(buildSubmissionData(formState, mode)); };

  return <form onSubmit={handleSubmit} className={cn('space-y-5 rounded-[32px] border border-white/10 bg-slate-950/45 p-4 shadow-[0_40px_120px_rgba(15,23,42,0.55)] sm:p-6', className)}><FormHeader mode={mode} /><div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]"><div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"><SectionLabel icon={User2} label={mode === 'proxy' ? 'Friend Name' : 'Name'} /><input value={formState.name} onChange={(event) => updateField('name', event.target.value)} placeholder={mode === 'proxy' ? '친구 이름' : '이름 또는 닉네임'} className={getFieldClassName()} required /></div><div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"><SectionLabel icon={User2} label="Gender" /><GenderButtons value={formState.gender} onChange={(value) => updateField('gender', value)} /></div></div><div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr_1fr]"><div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"><SectionLabel icon={Calendar} label="Calendar" /><select value={formState.calendarType} onChange={(event) => updateField('calendarType', event.target.value as CalendarType)} className={getFieldClassName()}><option value="solar">양력</option><option value="lunar">음력</option></select></div><div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"><SectionLabel icon={Calendar} label="Birth Date" /><input value={formState.birthDate} onChange={handleBirthDateChange} inputMode="numeric" maxLength={10} placeholder="1994-11-08" className={getFieldClassName()} required /></div><div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"><SectionLabel icon={Clock3} label="Birth Time" /><input value={formState.birthTime} onChange={handleBirthTimeChange} inputMode="numeric" maxLength={5} placeholder="12:00" className={getFieldClassName()} required /></div></div>{mode === 'self' ? <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]"><div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"><SectionLabel icon={Sparkles} label="Worry Type" /><select value={formState.worryType} onChange={(event) => updateField('worryType', event.target.value as CareerWorryType)} className={getFieldClassName()}>{CAREER_WORRY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div><div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"><SectionLabel icon={Sparkles} label="Career Question" /><textarea value={formState.question} onChange={(event) => updateField('question', event.target.value)} rows={5} placeholder="예: 지금 이직을 준비해도 좋은 시기인지, 어떤 직무가 제 강점과 맞는지 알고 싶어요." className={`${getFieldClassName()} min-h-[140px] resize-none leading-7`} required /></div></div> : null}<button type="submit" disabled={isBusy || !isFormReady(formState, mode)} className="w-full rounded-[24px] bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 py-4 font-semibold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50">{isBusy ? 'Analyzing cosmic signals...' : mode === 'proxy' ? 'Check Friend&apos;s Fate' : 'Start Career Reading'}</button></form>;
}

export default CareerInputForm;
