'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';

interface CareerResult {
  jobId: string;
  title: string;
  description: string;
  traits: string[];
  shareText: string;
}

export default function CareerTestClient() {
  const [step, setStep] = useState<'input' | 'loading' | 'result'>('input');
  
  // Form state
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState('unknown');
  
  // API result state
  const [result, setResult] = useState<CareerResult | null>(null);
  const [error, setError] = useState('');
  
  // UI state
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!birthDate) {
      setError('생년월일을 입력해주세요.');
      return;
    }
    if (birthDate.replace(/\D/g, '').length !== 8) {
      setError('YYYYMMDD 형식의 8자리 생년월일을 입력해주세요.');
      return;
    }
    
    setError('');
    setStep('loading');

    try {
      // 1. Fetch data
      const res = await fetch('/api/viral/career-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthDate, birthTime, gender }),
      });
      
      if (!res.ok) {
        throw new Error('데이터를 가져오는데 실패했습니다.');
      }
      
      const data = await res.json();
      setResult(data);
      
      // 2. Artificial delay for the loading animation experience
      setTimeout(() => {
        setStep('result');
      }, 2500);
      
    } catch (err) {
      console.error(err);
      setError('오류가 발생했습니다. 다시 시도해주세요.');
      setStep('input');
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    try {
      const currentUrl = window.location.href; // e.g. /viral/career-test
      // Create sharable link with jobId parameter
      const shareUrl = `${currentUrl}?jobId=${result.jobId}`;
      const textToCopy = `${result.shareText}\n${shareUrl}`;
      
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('복사에 실패했습니다. 기기 환경을 확인해주세요.');
    }
  };

  return (
    <div className="w-full">
      {/* 1. INPUT STEP */}
      {step === 'input' && (
        <form onSubmit={handleSubmit} className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col gap-6">
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-starlight mb-2">사주 정보 입력</h2>
            <p className="text-sm text-dim">정확한 추천을 위해 태어난 정보를 입력해주세요</p>
          </div>
          
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-moonlight mb-1">생년월일 (8자리) *</label>
              <input 
                type="text" 
                placeholder="예: 19950505" 
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                maxLength={8}
                className="w-full px-4 py-3 bg-deep-navy/50 border border-white/10 rounded-xl text-starlight placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-acc-gold/50 transition-all font-mono"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-moonlight mb-1">태어난 시간 (선택)</label>
              <input 
                type="time" 
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-4 py-3 bg-deep-navy/50 border border-white/10 rounded-xl text-starlight placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-acc-gold/50 transition-all font-mono"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-moonlight mb-1">성별 (선택)</label>
              <div className="flex gap-4">
                {['여성', '남성', '선택안함'].map((label, idx) => {
                  const values = ['female', 'male', 'unknown'];
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setGender(values[idx])}
                      className={`flex-1 py-3 px-2 rounded-xl border transition-all text-sm font-medium ${gender === values[idx] ? 'bg-acc-gold/20 border-acc-gold text-acc-gold' : 'bg-transparent border-white/10 text-dim hover:bg-white/5'}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

          <button 
            type="submit" 
            className="w-full mt-4 py-4 bg-gradient-to-r from-acc-gold via-amber-300 to-acc-gold bg-[length:200%_auto] text-deep-navy font-bold text-lg tracking-tight rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform duration-300"
          >
            🔥 내 진짜 직업 확인하기
          </button>
        </form>
      )}

      {/* 2. LOADING STEP */}
      {step === 'loading' && (
        <div className="p-12 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-4 border-acc-gold/30 rounded-full animate-ping"></div>
            <div className="absolute inset-2 border-4 border-t-acc-gold border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-acc-gold/20 rounded-full animate-pulse flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-starlight animate-pulse">우주의 기운을 모아...</h3>
          <p className="text-dim mt-2 tracking-widest text-sm">당신의 노동 궤적 추적 중</p>
        </div>
      )}

      {/* 3. RESULT STEP */}
      {step === 'result' && result && (
        <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md shadow-2xl overflow-hidden animate-fade-in">
          {/* Header/Card Idea */}
          <div className="bg-gradient-to-br from-indigo-900/50 to-deep-navy/80 p-8 text-center relative">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <span className="text-6xl text-white mix-blend-overlay font-serif italic">Job</span>
            </div>
            
            <p className="text-acc-gold font-bold text-sm tracking-widest mb-2 shadow-black/50 drop-shadow-md">당신의 리얼 직장 생존 타입</p>
            <h2 className="text-3xl font-extrabold text-white leading-tight break-keep mb-6">
              {result.title}
            </h2>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {result.traits.map(trait => (
                <span key={trait} className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium text-blue-200 border border-white/5 backdrop-blur-sm">
                  #{trait}
                </span>
              ))}
            </div>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="text-starlight/90 leading-relaxed break-keep">
              {result.description}
            </div>
            
            <div className="pt-6 border-t border-white/10 space-y-4">
              <button 
                onClick={copyToClipboard}
                className={`w-full py-4 font-bold text-lg tracking-tight rounded-full transition-all duration-300 flex items-center justify-center gap-2 ${copied ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {copied ? '✅ 링크와 복사 완료!' : '📋 결과 텍스트 복사하기 (친구/쓰레드 공유)'}
              </button>
              
              <Link href="/" className="w-full flex items-center justify-center py-4 bg-gradient-to-r from-acc-gold to-amber-500 text-deep-navy font-bold text-lg tracking-tight rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-101 hover:brightness-110 transition-all duration-300">
                🔮 오라클에게 내 연애운도 묻기
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
