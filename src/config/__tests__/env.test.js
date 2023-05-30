import { HOST_ALIASES, resolveApiBaseUrl, sanitizeBaseUrl } from '../env';

describe('sanitizeBaseUrl', () => {
  it('accepts a well-formed URL', () => {
    expect(sanitizeBaseUrl('http://localhost:3000')).toBe('http://localhost:3000');
  });

  it('trims surrounding whitespace', () => {
    // A trailing space in a .env file produces a URL every client rejects.
    expect(sanitizeBaseUrl('http://localhost:3000 ')).toBe('http://localhost:3000');
    expect(sanitizeBaseUrl('\thttps://api.example.com\n')).toBe('https://api.example.com');
  });

  it('strips trailing slashes so paths never double up', () => {
    expect(sanitizeBaseUrl('http://localhost:3000///')).toBe('http://localhost:3000');
  });

  it.each(['', '   ', 'undefined', 'null', 'NONE'])('rejects the placeholder %p', (value) => {
    expect(sanitizeBaseUrl(value)).toBeNull();
  });

  it('rejects a value with no scheme, which is how "undefined/api" happens', () => {
    expect(sanitizeBaseUrl('undefined/api')).toBeNull();
    expect(sanitizeBaseUrl('localhost:3000')).toBeNull();
  });

  it.each([null, undefined, 42, {}])('rejects the non-string %p', (value) => {
    expect(sanitizeBaseUrl(value)).toBeNull();
  });
});

describe('resolveApiBaseUrl', () => {
  it('prefers an explicitly configured URL', () => {
    expect(resolveApiBaseUrl({ configured: 'https://api.example.com/', platform: 'ios' })).toBe(
      'https://api.example.com',
    );
  });

  it('falls back to localhost on iOS and web', () => {
    expect(resolveApiBaseUrl({ platform: 'ios' })).toBe('http://localhost:3000');
    expect(resolveApiBaseUrl({ platform: 'web' })).toBe('http://localhost:3000');
  });

  it('uses 10.0.2.2 on Android, because an emulator cannot see localhost', () => {
    expect(resolveApiBaseUrl({ platform: 'android' })).toBe(`http://${HOST_ALIASES.android}:3000`);
  });

  it('ignores a placeholder value and still returns something usable', () => {
    expect(resolveApiBaseUrl({ configured: 'undefined', platform: 'ios' })).toBe(
      'http://localhost:3000',
    );
  });
});
