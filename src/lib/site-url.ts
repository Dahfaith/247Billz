export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;

  if (process.env.NODE_ENV === 'production') {
    if (!url) {
      throw new Error('Environment variable NEXT_PUBLIC_SITE_URL must be set in production');
    }
    return url.replace(/\/$/, '');
  }

  return (url || 'http://localhost:3000').replace(/\/$/, '');
}

export function getApiBase(path = ''): string {
  const base = getSiteUrl();
  if (!path) return base;
  return `${base}/${path.replace(/^\//, '')}`;
}
