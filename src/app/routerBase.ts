export function normalizeRouterBasename(baseUrl: string) {
  const trimmed = baseUrl.trim();

  if (!trimmed || trimmed === '/') {
    return '/';
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return withLeadingSlash.replace(/\/+$/g, '');
}
