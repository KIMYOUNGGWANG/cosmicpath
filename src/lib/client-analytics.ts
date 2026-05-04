/**
 * 브라우저 사이드 경량 이벤트 트래킹 헬퍼.
 * /api/growth/track 엔드포인트로 fire-and-forget 방식으로 이벤트를 전송합니다.
 *
 * 사용 예:
 *   import { trackEvent } from '@/lib/client-analytics';
 *   trackEvent('paywall_view', { readingId, language: 'ko' });
 */

interface TrackEventOptions {
  readingId?: string;
  referralCode?: string;
  source?: string;
  step?: string;
  language?: 'ko' | 'en';
  context?: string;
  price?: string;
  plan?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 이벤트를 /api/growth/track 으로 비동기 전송합니다.
 * 실패해도 UI에 영향 없음 (fire-and-forget).
 */
export function trackEvent(event: string, options: TrackEventOptions = {}): void {
  // 서버 환경에서는 실행하지 않음
  if (typeof window === 'undefined') return;

  const sessionId = getOrCreateSessionId();
  const path = window.location.pathname;

  void fetch('/api/growth/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event,
      sessionId,
      path,
      ...options,
    }),
    // keepalive: 페이지 이탈 시에도 전송 완료
    keepalive: true,
  }).catch(() => {
    // 이벤트 전송 실패는 무시 — UI에 영향 없음
  });
}

// ── 세션 ID 관리 ─────────────────────────────────────────────────────────────

const SESSION_ID_KEY = 'cp_session_id';

function getOrCreateSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_ID_KEY);
    if (existing) return existing;

    const newId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(SESSION_ID_KEY, newId);
    return newId;
  } catch {
    // sessionStorage 접근 불가 (iframe, 시크릿 모드 등)
    return `s_${Date.now()}`;
  }
}
