import { CacheModule, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common'
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

const KEY = 'hello';

@Injectable()
export class AppService {

    constructor(
        @Inject(CACHE_MANAGER) private readonly cache: Cache,
    ) {}

    async setHello(name: string): Promise<void> {
        try {
            await this.cache.set(KEY, name, 3600);
        } catch (error) {
            console.error("Error setting cache:", error);
        }
    }

    async getHello(): Promise<string> {
        const name = await this.cache.get(KEY) || 'chacha redis!';
        return `Hello ${name}!`;
    }
}
