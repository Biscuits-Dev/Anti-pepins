import { getClientIp } from '@/lib/ratelimit';

describe('getClientIp', () => {
  it("extrait la première IP de x-forwarded-for", () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getClientIp(req)).toBe('1.2.3.4');
  });

  it("extrait l'IP de x-real-ip si pas de x-forwarded-for", () => {
    const req = new Request('http://localhost', {
      headers: { 'x-real-ip': '9.9.9.9' },
    });
    expect(getClientIp(req)).toBe('9.9.9.9');
  });

  it("retourne 'unknown' si aucun header présent", () => {
    const req = new Request('http://localhost');
    expect(getClientIp(req)).toBe('unknown');
  });

  it("trim les espaces dans x-forwarded-for", () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '  10.0.0.1  , 10.0.0.2' },
    });
    expect(getClientIp(req)).toBe('10.0.0.1');
  });
});
