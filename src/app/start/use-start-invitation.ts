'use client';

import { useEffect, useState } from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';

export function useStartInvitation(searchParams: ReadonlyURLSearchParams) {
  const inviteCode = searchParams.get('invite') || undefined;
  const [inviterName, setInviterName] = useState<string | undefined>(undefined);
  const [isInvitationMode, setIsInvitationMode] = useState(false);

  useEffect(() => {
    if (!inviteCode) return;

    fetch(`/api/invite/verify?code=${inviteCode}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.isValid) {
          setInviterName(data.hostName);
          setIsInvitationMode(true);
        }
      })
      .catch((error) => console.error('Invite verification failed:', error));
  }, [inviteCode]);

  return { inviteCode, inviterName, isInvitationMode };
}
