import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import {
  getOracleChatDailyHook,
  getOracleChatHistoryForUser,
} from '@/lib/oracle-chat';
import OracleChatClient from './OracleChatClient';

export const metadata: Metadata = {
  title: '그랜드 오라클 | CosmicPath',
  description: '사주, 점성술, 자미두수가 함께 답하는 개인 오라클 채팅',
};

export default async function OracleChatPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect('/login?callbackUrl=/oracle-chat');
  }

  const initialHistory = await getOracleChatHistoryForUser({
    userId,
    limit: 30,
  });
  const initialDailyHook = await getOracleChatDailyHook({
    userId,
    roomId: initialHistory.roomId,
  });

  return (
    <main className="flex min-h-screen w-full flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-black/20 px-5 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Grand Oracle</h1>
            <p className="text-xs text-slate-400">결정과 타이밍을 함께 읽는 개인 오라클 채팅</p>
          </div>
          <p className="hidden text-xs text-slate-500 sm:block">Career wedge MVP</p>
        </div>
      </header>

      <div className="flex-1">
        <OracleChatClient
          initialDailyHook={initialHistory.messages.length > 0 ? initialDailyHook.hookMessage : null}
          initialDomain={initialHistory.domain}
          initialMessages={initialHistory.messages}
          initialRoomId={initialHistory.roomId}
        />
      </div>
    </main>
  );
}
