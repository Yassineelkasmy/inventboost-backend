import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class SessionService {

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) { }

    async setSession(uid: string, sessionData: any, ttl: number = 86400) {
        await this.cacheManager.set(uid, sessionData, ttl)
    }

    async getSession(uid: string): Promise<any> {
        return await this.cacheManager.get(uid)
    }

    async deleteSession(uid: string): Promise<void> {
        await this.cacheManager.del(uid)
    }
}
