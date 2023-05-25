/** Requests that take longer than this are aborted rather than hanging the UI. */
export const DEFAULT_TIMEOUT_MS = 10_000;

/** Everything thrown by the HTTP layer is normalised to this type. */
export class HttpError extends Error {
  constructor(message, { status = null, url = null, kind = 'http', cause = null } = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.url = url;
    this.kind = kind;
    this.cause = cause;
  }

  /** True for failures a retry might fix (offline, timeout, 5xx). */
  get isRetryable() {
    return this.kind !== 'http' || (this.status !== null && this.status >= 500);
  }
}

export function joinUrl(baseUrl, path) {
  const base = String(baseUrl ?? '').replace(/\/+$/, '');
  const suffix = String(path ?? '');
  if (suffix === '') {
    return base;
  }
  return `${base}/${suffix.replace(/^\/+/, '')}`;
}

export function withQuery(path, params = {}) {
  const pairs = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== false)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  return pairs.length === 0 ? path : `${path}?${pairs.join('&')}`;
}

/**
 * Thin fetch wrapper. `fetchImpl` is injected so tests never touch the network
 * and so a future caller can swap in an instrumented or retrying transport.
 */
export function createHttpClient({
  baseUrl,
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new TypeError('createHttpClient requires a fetch implementation');
  }

  async function request(path, { method = 'GET', body } = {}) {
    const url = joinUrl(baseUrl, path);
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller === null ? null : setTimeout(() => controller.abort(), timeoutMs);

    let response;
    try {
      response = await fetchImpl(url, {
        method,
        headers: {
          Accept: 'application/json',
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        ...(controller === null ? {} : { signal: controller.signal }),
      });
    } catch (error) {
      const aborted = error?.name === 'AbortError';
      throw new HttpError(
        aborted
          ? `${method} ${url} timed out after ${timeoutMs}ms`
          : `${method} ${url} could not reach the server`,
        { url, kind: aborted ? 'timeout' : 'network', cause: error },
      );
    } finally {
      if (timer !== null) {
        clearTimeout(timer);
      }
    }

    if (!response.ok) {
      throw new HttpError(`${method} ${url} failed with HTTP ${response.status}`, {
        status: response.status,
        url,
        kind: 'http',
      });
    }

    if (response.status === 204) {
      return null;
    }

    try {
      return await response.json();
    } catch (error) {
      throw new HttpError(`${method} ${url} returned a body that is not JSON`, {
        status: response.status,
        url,
        kind: 'parse',
        cause: error,
      });
    }
  }

  return {
    baseUrl,
    get: (path) => request(path, { method: 'GET' }),
    patch: (path, body) => request(path, { method: 'PATCH', body }),
  };
}
