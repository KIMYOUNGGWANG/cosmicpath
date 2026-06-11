export function appendAccessKeyFragment(url: string, accessKey?: string | null): string {
  if (!accessKey) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ''));
    hashParams.set('accessKey', accessKey);
    parsedUrl.hash = hashParams.toString();
    return parsedUrl.toString();
  } catch (error) {
    if (error instanceof TypeError) {
      const hash = `accessKey=${encodeURIComponent(accessKey)}`;
      return url.includes('#') ? `${url}&${hash}` : `${url}#${hash}`;
    }
    throw error;
  }
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
}
