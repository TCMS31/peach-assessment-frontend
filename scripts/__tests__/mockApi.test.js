import http from 'node:http';

import { createMockServer, DEFAULT_PORT, resolvePort } from '../mock-api';

describe('resolvePort', () => {
  it('defaults when neither --port nor PORT is given', () => {
    expect(resolvePort(['node', 'scripts/mock-api.js'], {})).toBe(DEFAULT_PORT);
  });

  it('reads PORT from the environment', () => {
    expect(resolvePort(['node', 'scripts/mock-api.js'], { PORT: '4100' })).toBe(4100);
  });

  it('lets --port override PORT', () => {
    expect(resolvePort(['node', 'mock-api.js', '--port', '4200'], { PORT: '4100' })).toBe(4200);
  });

  it.each(['abc', '70000', '-1', '3.5'])('rejects the port %p', (value) => {
    expect(() => resolvePort(['node', 'mock-api.js', '--port', value], {})).toThrow(RangeError);
  });
});

/** global.fetch is stubbed to throw in jest.setup.js, so talk to the server over node:http. */
function request(port, method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? undefined : JSON.stringify(body);
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        method,
        path,
        headers: payload ? { 'Content-Type': 'application/json' } : {},
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
      },
    );
    req.on('error', reject);
    req.end(payload);
  });
}

describe('mock API', () => {
  let server;
  let port;

  beforeEach(async () => {
    server = createMockServer();
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    port = server.address().port;
  });

  afterEach(() => new Promise((resolve) => server.close(resolve)));

  it('serialises transactions with nested merchant and category and string amounts', async () => {
    const { status, body } = await request(port, 'GET', '/transactions');
    expect(status).toBe(200);
    expect(body).toHaveLength(10);
    expect(body[1]).toMatchObject({
      id: 2,
      name: 'SFO to JFK',
      amount: '129.97',
      merchant: { name: 'United' },
      category: { name: 'Shops' },
    });
  });

  it('filters by pending_review the way the Rails index action does', async () => {
    const { body } = await request(port, 'GET', '/transactions?pending_review=true');
    expect(body.length).toBeGreaterThan(0);
    expect(body.every((tx) => tx.reviewed === false)).toBe(true);
  });

  it('applies the nested category_attributes payload', async () => {
    const { status, body } = await request(port, 'PATCH', '/transactions/2', {
      transaction: { category_attributes: { name: 'Travel', emoji: '✈️' } },
    });
    expect(status).toBe(200);
    expect(body.category.name).toBe('Travel');
  });

  it('rejects an unknown category with a 422 and leaves the row untouched', async () => {
    const { status, body } = await request(port, 'PATCH', '/transactions/2', {
      transaction: { reviewed: true, category_attributes: { name: 'Nope' } },
    });
    expect(status).toBe(422);
    expect(body).toEqual({ message: ['Category is not valid'] });

    const after = await request(port, 'GET', '/transactions/2');
    expect(after.body.reviewed).toBe(false);
    expect(after.body.category.name).toBe('Shops');
  });

  it('answers 404 for an unknown transaction', async () => {
    const { status } = await request(port, 'GET', '/transactions/999');
    expect(status).toBe(404);
  });

  it('keeps each server instance isolated', async () => {
    await request(port, 'PATCH', '/transactions/2', { transaction: { reviewed: true } });
    const other = createMockServer();
    await new Promise((resolve) => other.listen(0, '127.0.0.1', resolve));
    const { body } = await request(other.address().port, 'GET', '/transactions/2');
    await new Promise((resolve) => other.close(resolve));
    expect(body.reviewed).toBe(false);
  });
});
