export function getRedisUrl(): string {
  const host = process.env.REDIS_HOST ?? "localhost";
  const port = process.env.REDIS_PORT ?? "6379";

  return `redis://${host}:${port}`;
}
