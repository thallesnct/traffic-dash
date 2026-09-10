import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { generationKey } from "@traffic-dashboard/shared";
import { Redis } from "ioredis";

import type { Served } from "../common/served";
import { getRedisUrl } from "./redis-url";

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly client: Redis;
  private unavailableLogged = false;

  constructor() {
    this.client = new Redis(getRedisUrl(), {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });

    this.client.on("error", (error: Error) => this.logUnavailable(error));
  }

  async onModuleDestroy(): Promise<void> {
    this.client.disconnect();
  }

  async getGeneration(): Promise<number> {
    try {
      const current = await this.client.get(generationKey());

      if (current !== null) return Number(current);

      await this.client.set(generationKey(), "0", "NX");

      return Number((await this.client.get(generationKey())) ?? 0);
    } catch (error) {
      this.logUnavailable(error);

      return 0;
    }
  }

  async bumpGeneration(): Promise<number> {
    try {
      return await this.client.incr(generationKey());
    } catch (error) {
      this.logUnavailable(error);

      return 0;
    }
  }

  async getOrSetJson<TValue>(
    key: string,
    ttlSeconds: number,
    loader: () => Promise<TValue>,
  ): Promise<Served<TValue>> {
    const cached = await this.readJson<TValue>(key);

    if (cached !== undefined) return { body: cached, cacheTier: "hit" };

    const body = await loader();

    await this.writeJson(key, body, ttlSeconds);

    return { body, cacheTier: "miss" };
  }

  private async readJson<TValue>(key: string): Promise<TValue | undefined> {
    let raw: string | null;

    try {
      raw = await this.client.get(key);
    } catch (error) {
      this.logUnavailable(error);

      return undefined;
    }

    if (raw === null) return undefined;

    try {
      return JSON.parse(raw) as TValue;
    } catch {
      this.logger.warn(`Discarding unparseable cache entry at ${key}`);

      return undefined;
    }
  }

  private async writeJson(
    key: string,
    value: unknown,
    ttlSeconds: number,
  ): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (error) {
      this.logUnavailable(error);
    }
  }

  private logUnavailable(error: unknown): void {
    if (this.unavailableLogged) return;

    this.unavailableLogged = true;
    this.logger.error(
      `Redis unavailable, serving uncached: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
