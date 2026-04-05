import { Ratelimit } from '@upstash/ratelimit';
import { Redis }     from '@upstash/redis';

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`[Config] Variable d'environnement manquante : ${key}`);
  }
  return value.trim();
}

const redis = new Redis({
  url:   getRequiredEnv('UPSTASH_REDIS_REST_URL'),
  token: getRequiredEnv('UPSTASH_REDIS_REST_TOKEN'),
});

export const contactRatelimit = new Ratelimit({
  redis,
  limiter:   Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
  prefix:    'rl:contact',
});

export interface RateLimitResult {
  allowed:   boolean;
  remaining: number;
  reset:     number;
}