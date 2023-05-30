import { createHttpClient, HttpError, joinUrl, withQuery } from '../httpClient';

describe('joinUrl', () => {
  it.each([
    ['http://localhost:3000', '/categories', 'http://localhost:3000/categories'],
    ['http://localhost:3000/', '/categories', 'http://localhost:3000/categories'],
    ['http://localhost:3000//', 'categories', 'http://localhost:3000/categories'],
  ])('joins %p + %p', (base, path, expected) => {
    expect(joinUrl(base, path)).toBe(expected);
  });
});

describe('withQuery', () => {
  it('omits undefined, null and false values', () => {
    expect(withQuery('/transactions', { pending_review: undefined, reviewed: false })).toBe(
      '/transactions',
    );
  });

  it('encodes the values it keeps', () => {
    expect(withQuery('/transactions', { pending_review: true })).toBe(
      '/transactions?pending_review=true',
    );
  });
});

describe('createHttpClient', () => {
  const baseUrl = 'http://localhost:3000';

  it('refuses to build without a fetch implementation', () => {
    expect(() => createHttpClient({ baseUrl, fetchImpl: null })).toThrow(TypeError);
  });

  it('returns parsed JSON on success', async () => {
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ a: 1 }),
    }));
    const client = createHttpClient({ baseUrl, fetchImpl });

    await expect(client.get('/categories')).resolves.toEqual({ a: 1 });
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:3000/categories',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('returns null for 204 rather than trying to parse an empty body', async () => {
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      status: 204,
      json: async () => {
        throw new Error('should not be called');
      },
    }));
    await expect(createHttpClient({ baseUrl, fetchImpl }).get('/x')).resolves.toBeNull();
  });

  it('raises HttpError carrying the status for a 4xx', async () => {
    const fetchImpl = jest.fn(async () => ({ ok: false, status: 422, json: async () => ({}) }));
    const client = createHttpClient({ baseUrl, fetchImpl });

    const error = await client.get('/transactions/9').catch((e) => e);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(422);
    expect(error.kind).toBe('http');
    expect(error.isRetryable).toBe(false);
  });

  it('marks a 5xx as retryable', async () => {
    const fetchImpl = jest.fn(async () => ({ ok: false, status: 503, json: async () => ({}) }));
    const error = await createHttpClient({ baseUrl, fetchImpl })
      .get('/x')
      .catch((e) => e);
    expect(error.isRetryable).toBe(true);
  });

  it('normalises a transport failure into HttpError, not a raw TypeError', async () => {
    const fetchImpl = jest.fn(async () => {
      throw new TypeError('Network request failed');
    });
    const error = await createHttpClient({ baseUrl, fetchImpl })
      .get('/x')
      .catch((e) => e);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.kind).toBe('network');
    expect(error.isRetryable).toBe(true);
  });

  it('aborts and reports a timeout instead of hanging', async () => {
    const fetchImpl = jest.fn(async () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      throw error;
    });
    const error = await createHttpClient({ baseUrl, fetchImpl, timeoutMs: 5 })
      .get('/x')
      .catch((e) => e);
    expect(error.kind).toBe('timeout');
    expect(error.message).toMatch(/timed out after 5ms/);
  });

  it('reports an HTML error page as a parse failure, not as data', async () => {
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token <');
      },
    }));
    const error = await createHttpClient({ baseUrl, fetchImpl })
      .get('/x')
      .catch((e) => e);
    expect(error.kind).toBe('parse');
  });

  it('sends a JSON body and content type on PATCH', async () => {
    const fetchImpl = jest.fn(async () => ({ ok: true, status: 200, json: async () => ({}) }));
    await createHttpClient({ baseUrl, fetchImpl }).patch('/transactions/1', { a: 1 });

    const [, options] = fetchImpl.mock.calls[0];
    expect(options.method).toBe('PATCH');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({ a: 1 });
  });
});
