import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export interface RateLimitResult {
  allowed:   boolean;
  remaining: number;
  resetAt:   number; // Unix timestamp ms
}

interface RateLimitOptions {
  max:      number;
  windowMs: number;
}

// Redis lazy-initialisé pour éviter les erreurs en dev sans Upstash
let _redis: Redis | null = null;
function getRedis(): Redis {
  if (!_redis) {
    const url   = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) throw new Error('[Ratelimit] Variables Upstash manquantes');
    _redis = new Redis({ url, token });
  }
  return _redis;
}

// Cache des instances Ratelimit (évite de recréer à chaque requête)
const limiterCache = new Map<string, Ratelimit>();
function getLimiter(max: number, windowMs: number): Ratelimit {
  const key = `${max}:${windowMs}`;
  if (!limiterCache.has(key)) {
    limiterCache.set(key, new Ratelimit({
      redis:   getRedis(),
      limiter: Ratelimit.slidingWindow(max, `${Math.round(windowMs / 1000)} s`),
      prefix:  'rl',
    }));
  }
  return limiterCache.get(key)!;
}

/**
 * Rate limiting distribué via Upstash Redis (fonctionne en serverless multi-instance).
 * En dev sans Upstash configuré, laisse passer toutes les requêtes.
 */
export async function checkRateLimit(
  key: string,
  { max, windowMs }: RateLimitOptions,
): Promise<RateLimitResult> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Dev sans Redis : pas de limitation
    return { allowed: true, remaining: max - 1, resetAt: Date.now() + windowMs };
  }

  try {
    const { success, remaining, reset } = await getLimiter(max, windowMs).limit(key);
    return { allowed: success, remaining, resetAt: reset };
  } catch (err) {
    console.error('[Ratelimit] Upstash error:', err);
    // En production : fail-closed pour éviter le DDoS si Redis est indisponible.
    // En dev : on laisse passer pour ne pas bloquer le développement local.
    if (process.env.NODE_ENV === 'production') {
      return { allowed: false, remaining: 0, resetAt: Date.now() + windowMs };
    }
    return { allowed: true, remaining: max - 1, resetAt: Date.now() + windowMs };
  }
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}
