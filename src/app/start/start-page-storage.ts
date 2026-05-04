export type StartFlowDebugFn = (event: string, details?: Record<string, unknown>) => void;

export function saveToSessionAndBackup(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
    localStorage.setItem(key, value);
    localStorage.setItem('backup_timestamp', Date.now().toString());
  } catch (error) {
    console.error('Storage quota exceeded or error:', error);
  }
}

export function hasStoredPayload(value: string | null | undefined) {
  return Boolean(value && value !== 'null' && value !== 'undefined');
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getStoredReadingId() {
  if (typeof window === 'undefined') return null;

  return (
    sessionStorage.getItem('pending_reading_id') ||
    localStorage.getItem('pending_reading_id')
  );
}

export function getStoredReadingAccessKey() {
  if (typeof window === 'undefined') return null;

  return (
    sessionStorage.getItem('pending_reading_access_key') ||
    localStorage.getItem('pending_reading_access_key')
  );
}

export function getStoredPaymentSessionId() {
  if (typeof window === 'undefined') return null;

  return (
    sessionStorage.getItem('payment_session_id') ||
    localStorage.getItem('payment_session_id')
  );
}

export function getAccessKeyFromLocation() {
  if (typeof window === 'undefined') return null;

  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));

  return hashParams.get('accessKey') || url.searchParams.get('accessKey');
}

export function stripAccessKeyFromLocation() {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
  const hadSearchAccessKey = url.searchParams.has('accessKey');
  const hadHashAccessKey = hashParams.has('accessKey');

  if (!hadSearchAccessKey && !hadHashAccessKey) {
    return;
  }

  url.searchParams.delete('accessKey');
  hashParams.delete('accessKey');
  url.hash = hashParams.toString();

  window.history.replaceState(
    window.history.state,
    '',
    `${url.pathname}${url.search}${url.hash}`
  );
}

export function syncReadingAccessKey(accessKey?: string | null) {
  if (!accessKey) return;

  saveToSessionAndBackup('pending_reading_access_key', accessKey);
}

export function clearSessionAndBackup() {
  if (typeof window === 'undefined') return;

  const keys = [
    'pending_reading_data',
    'pending_report_data',
    'pending_metadata',
    'pending_reading_id',
    'pending_reading_access_key',
    'payment_completed',
    'decision_accepted',
    'is_session_active',
    'is_premium_user',
    'promo_user',
    'reading_step',
    'payment_session_id',
    'payment_reading_id',
  ];

  keys.forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });

  localStorage.removeItem('backup_timestamp');
}

export function clearTransientPremiumResumeFlags() {
  if (typeof window === 'undefined') return;

  ['payment_completed', 'is_premium_user', 'promo_user'].forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
}

export function buildReadingShareUrl(readingId?: string | null) {
  if (typeof window === 'undefined' || !readingId) return undefined;

  const origin = window.location.origin;
  const appUrl = origin.endsWith('/') ? origin.slice(0, -1) : origin;

  return `${appUrl}/share/${readingId}`;
}

export function syncResultUrl(options: {
  readingId?: string | null;
  inviteCode?: string;
  autoReferralCode?: string;
  onDebug?: StartFlowDebugFn;
  updateUrl?: (url: string) => void;
}) {
  if (typeof window === 'undefined') return;

  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.delete('reset');
  currentUrl.searchParams.delete('paid');
  currentUrl.searchParams.delete('canceled');
  currentUrl.searchParams.delete('accessKey');

  if (options.readingId) {
    currentUrl.searchParams.set('reading_id', options.readingId);
  } else {
    currentUrl.searchParams.delete('reading_id');
  }

  if (options.inviteCode) {
    currentUrl.searchParams.set('invite', options.inviteCode);
  }

  if (options.autoReferralCode) {
    currentUrl.searchParams.set('referralCode', options.autoReferralCode);
  }

  if (options.updateUrl) {
    options.updateUrl(currentUrl.pathname + currentUrl.search);
  } else {
    window.history.replaceState(
      options.readingId ? { readingId: options.readingId } : window.history.state,
      '',
      currentUrl.toString()
    );
  }

  options.onDebug?.('sync_result_url', {
    readingId: options.readingId || null,
    url: currentUrl.toString(),
  });
}

export async function waitForPendingReadingId(timeoutMs = 1200) {
  if (typeof window === 'undefined') return null;

  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const pendingId =
      sessionStorage.getItem('pending_reading_id') ||
      localStorage.getItem('pending_reading_id');

    if (pendingId) {
      return pendingId;
    }

    await sleep(150);
  }

  return null;
}
