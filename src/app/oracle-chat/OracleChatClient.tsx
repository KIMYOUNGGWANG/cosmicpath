'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Send, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type {
  OracleChatDomain,
  OracleChatHistoryMessage,
  OracleChatMode,
} from '@/lib/oracle-chat';

type ChatMessage = OracleChatHistoryMessage & {
  isStreaming?: boolean;
};

interface OracleChatClientProps {
  initialDailyHook: string | null;
  initialDomain: OracleChatDomain;
  initialMessages: OracleChatHistoryMessage[];
  initialRoomId: string | null;
}

const DOMAIN_OPTIONS: Array<{ id: OracleChatDomain; label: string }> = [
  { id: 'career', label: '커리어' },
  { id: 'love', label: '관계' },
  { id: 'wealth', label: '재물' },
  { id: 'general', label: '일상' },
];

function getWelcomeMessage(domain: OracleChatDomain): ChatMessage {
  const copy: Record<OracleChatDomain, string> = {
    career: '커리어에서 지금 가장 큰 결정을 한 문장으로 말해보세요. 기다릴지, 움직일지부터 같이 보겠습니다.',
    love: '관계에서 가장 헷갈리는 지점을 한 문장으로 말해보세요. 감정과 타이밍을 같이 읽어볼게요.',
    wealth: '돈과 일에서 가장 망설이는 선택지를 한 문장으로 말해보세요. 리스크와 타이밍을 같이 보겠습니다.',
    general: '지금 가장 마음에 걸리는 질문을 한 문장으로 말해보세요. 먼저 흐름을 정리해드릴게요.',
  };

  return {
    id: 'oracle-welcome',
    role: 'oracle',
    content: copy[domain],
    mode: 'casual',
    createdAt: new Date(0).toISOString(),
  };
}

function extractFinalVerdict(content: string): string {
  const marker = '### 🔮 수석 오라클의 최종 결론';
  const index = content.indexOf(marker);
  if (index >= 0) {
    return content.slice(index + marker.length).trim();
  }
  return content.trim();
}

function RenderOracleMarkdown({ text }: { text: string }) {
  return (
    <div className="space-y-3 text-sm leading-7 text-slate-200">
      {text.split('\n').map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return null;
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={index} className="pt-2 text-sm font-semibold text-amber-200">
              {trimmed.slice(4)}
            </h3>
          );
        }

        if (trimmed.startsWith('- ')) {
          return (
            <p key={index} className="pl-3 text-slate-300">
              • {trimmed.slice(2)}
            </p>
          );
        }

        return <p key={index}>{trimmed}</p>;
      })}
    </div>
  );
}

function OracleMessageBody({ message }: { message: ChatMessage }) {
  if (message.mode !== 'council_briefing') {
    return <RenderOracleMarkdown text={message.content} />;
  }

  const finalVerdict = message.councilData?.finalVerdict || extractFinalVerdict(message.content);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">Final Verdict</p>
        <p className="mt-2 text-sm leading-7 text-amber-50">{finalVerdict}</p>
      </div>

      <details className="group rounded-2xl border border-white/10 bg-black/20 p-4">
        <summary className="cursor-pointer list-none text-sm font-medium text-slate-200">
          위원회 분석 보기
        </summary>
        <div className="mt-4 border-t border-white/10 pt-4">
          <RenderOracleMarkdown text={message.content} />
        </div>
      </details>
    </div>
  );
}

export default function OracleChatClient({
  initialDailyHook,
  initialDomain,
  initialMessages,
  initialRoomId,
}: OracleChatClientProps) {
  const [roomId, setRoomId] = useState<string | null>(initialRoomId);
  const [selectedDomain, setSelectedDomain] = useState<OracleChatDomain>(initialDomain);
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages.length > 0 ? initialMessages : [getWelcomeMessage(initialDomain)]
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paywallRequired, setPaywallRequired] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function syncLatestRoom() {
    const response = await fetch('/api/oracle-chat/history?limit=30', { cache: 'no-store' });
    if (!response.ok) {
      return;
    }

    const payload = await response.json() as {
      roomId: string | null;
      domain: OracleChatDomain;
      messages: OracleChatHistoryMessage[];
    };

    if (payload.roomId) {
      setRoomId(payload.roomId);
    }
    if (payload.messages.length > 0) {
      setMessages(payload.messages);
      setSelectedDomain(payload.domain);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!input.trim() || isLoading) {
      return;
    }

    const userContent = input.trim();
    const optimisticOracleId = `oracle-${Date.now()}`;
    const nextMessages: ChatMessage[] = [
      ...messages,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userContent,
        mode: 'casual',
        createdAt: new Date().toISOString(),
      },
      {
        id: optimisticOracleId,
        role: 'oracle',
        content: '',
        mode: 'casual',
        createdAt: new Date().toISOString(),
        isStreaming: true,
      },
    ];

    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);
    setPaywallRequired(false);

    try {
      const response = await fetch('/api/oracle-chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          domain: selectedDomain,
          content: userContent,
        }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          setPaywallRequired(true);
          setMessages((current) =>
            current.map((message) =>
              message.id === optimisticOracleId
                ? {
                    ...message,
                    content: '오늘의 무료 상담이 끝났어요. 구독하면 오라클 위원회와 무제한으로 이야기할 수 있어요.',
                    isStreaming: false,
                  }
                : message
            )
          );
          return;
        }

        throw new Error('메시지 전송에 실패했습니다.');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('스트림을 읽을 수 없습니다.');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';
      let finalMode: OracleChatMode = 'casual';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const eventBlock of events) {
          const line = eventBlock
            .split('\n')
            .find((eventLine) => eventLine.startsWith('data: '));

          if (!line) {
            continue;
          }

          const payload = JSON.parse(line.slice(6)) as {
            delta: string;
            done: boolean;
            mode?: OracleChatMode;
          };

          if (payload.done) {
            finalMode = payload.mode ?? finalMode;
            continue;
          }

          fullText += payload.delta;
          setMessages((current) =>
            current.map((message) =>
              message.id === optimisticOracleId
                ? { ...message, content: fullText }
                : message
            )
          );
        }
      }

      setMessages((current) =>
        current.map((message) =>
          message.id === optimisticOracleId
            ? {
                ...message,
                content: fullText || '질문을 더 구체적으로 남겨주시면 다음 결론이 선명해집니다.',
                mode: finalMode,
                isStreaming: false,
              }
            : message
        )
      );

      if (!roomId) {
        await syncLatestRoom();
      }
    } catch (error) {
      console.error(error);
      setMessages((current) =>
        current.map((message) =>
          message.id === optimisticOracleId
            ? {
                ...message,
                content: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                isStreaming: false,
              }
            : message
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  const canChangeDomain = !roomId && !messages.some((message) => message.role === 'user');

  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-5xl flex-col px-4 py-4 sm:px-6">
      <div className="mb-4 flex flex-wrap gap-2">
        {DOMAIN_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={!canChangeDomain}
            onClick={() => setSelectedDomain(option.id)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              selectedDomain === option.id
                ? 'border-amber-300/40 bg-amber-300/15 text-amber-100'
                : 'border-white/10 bg-white/5 text-slate-300'
            } ${canChangeDomain ? 'hover:border-white/30' : 'cursor-not-allowed opacity-70'}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {initialDailyHook ? (
        <div className="mb-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50">
          <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200">Daily Hook</p>
          <p className="mt-1 leading-6">{initialDailyHook}</p>
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto rounded-[28px] border border-white/10 bg-white/[0.03] px-4 py-5 shadow-2xl shadow-black/20 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative max-w-[88%] rounded-3xl px-5 py-4 sm:max-w-[78%] ${
                    message.role === 'user'
                      ? 'rounded-br-md bg-amber-500 text-slate-950'
                      : 'rounded-bl-md border border-white/10 bg-slate-900/70 text-slate-100'
                  }`}
                >
                  {message.role === 'oracle' && message.mode === 'council_briefing' ? (
                    <div className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-300/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                      <Sparkles className="h-3 w-3" />
                      Council Briefing
                    </div>
                  ) : null}

                  {message.role === 'oracle' ? (
                    <OracleMessageBody message={message} />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>
                  )}

                  {message.isStreaming ? (
                    <span className="ml-2 inline-block h-4 w-2 animate-pulse rounded-full bg-amber-300 align-middle" />
                  ) : null}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {paywallRequired ? (
        <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-sm text-amber-50">
          <p className="font-medium">오늘의 무료 상담이 모두 끝났습니다.</p>
          <p className="mt-1 text-amber-100/90">구독하면 오라클 위원회 브리핑을 계속 이어갈 수 있습니다.</p>
          <Link
            href="/billing"
            className="mt-3 inline-flex rounded-full bg-amber-300 px-4 py-2 text-sm font-medium text-slate-950"
          >
            구독 보러 가기
          </Link>
        </div>
      ) : null}

      <div className="mt-4 rounded-[28px] border border-white/10 bg-slate-950/90 p-4 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="지금 가장 고민되는 결정이나 타이밍을 한 문장으로 적어보세요."
              disabled={isLoading}
              className="w-full rounded-full border border-white/10 bg-white/5 py-4 pl-5 pr-14 text-sm text-white placeholder:text-slate-500 focus:border-amber-300/40 focus:outline-none focus:ring-1 focus:ring-amber-300/30 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="ml-0.5 h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="mx-auto mt-3 flex max-w-3xl items-center justify-center gap-1 text-[11px] text-slate-500">
          <AlertCircle className="h-3 w-3" />
          <span>오라클의 답변은 조언이며, 중요한 결정은 결국 당신의 판단으로 마무리해야 합니다.</span>
        </div>
      </div>
    </div>
  );
}
