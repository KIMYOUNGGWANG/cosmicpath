/**
 * 리딩 세션 관리
 * 결제 후 추가 질문 횟수 추적
 */

export interface ReadingSession {
    id: string;
    paymentSessionId: string;
    readingResult: unknown;
    followUpCount: number;
    followUpMax: number;
    followUpHistory: Message[];
    createdAt: Date;
    expiresAt: Date;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

/**
 * 로컬 스토리지에서 세션 저장/로드
 */
const SESSION_KEY = 'cosmicpath_session';

export function saveSession(session: ReadingSession): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadSession(): ReadingSession | null {
    if (typeof window === 'undefined') return null;

    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;

    const session = JSON.parse(data) as ReadingSession;

    // 만료 확인
    if (new Date(session.expiresAt) < new Date()) {
        clearSession();
        return null;
    }

    return session;
}

export function clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_KEY);
}

/**
 * 새 세션 생성
 */
export function createSession(
    paymentSessionId: string,
    readingResult: unknown,
    followUpMax: number = 0
): ReadingSession {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24시간 후 만료

    const session: ReadingSession = {
        id: `session_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        paymentSessionId,
        readingResult,
        followUpCount: 0,
        followUpMax,
        followUpHistory: [],
        createdAt: now,
        expiresAt,
    };

    saveSession(session);
    return session;
}

/**
 * 추가 질문 사용
 */
export function useFollowUp(session: ReadingSession, userMessage: string): ReadingSession | null {
    if (session.followUpCount >= session.followUpMax) {
        return null; // 질문 소진
    }

    const newMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
    };

    const updatedSession: ReadingSession = {
        ...session,
        followUpCount: session.followUpCount + 1,
        followUpHistory: [...session.followUpHistory, newMessage],
    };

    saveSession(updatedSession);
    return updatedSession;
}

/**
 * AI 응답 추가
 */
export function addAssistantMessage(session: ReadingSession, content: string): ReadingSession {
    const newMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: new Date(),
    };

    const updatedSession: ReadingSession = {
        ...session,
        followUpHistory: [...session.followUpHistory, newMessage],
    };

    saveSession(updatedSession);
    return updatedSession;
}

/**
 * 남은 질문 횟수 확인
 */
export function getRemainingQuestions(session: ReadingSession): number {
    return session.followUpMax - session.followUpCount;
}

/**
 * 질문 횟수 추가 (바이럴/결제 용)
 */
export function addCredits(session: ReadingSession, amount: number): ReadingSession {
    const updatedSession: ReadingSession = {
        ...session,
        followUpMax: session.followUpMax + amount,
    };
    saveSession(updatedSession);
    return updatedSession;
}
