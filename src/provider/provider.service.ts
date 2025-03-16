import { Injectable } from '@nestjs/common';
import { databaseSchema } from 'src/database/database.schema';
import { DrizzleService } from 'src/database/drizzle.service';

@Injectable()
export class ProviderService {
    constructor(private readonly drizzleService: DrizzleService) { }

    async getProviders() {
        try {
            const providers = await this.drizzleService.db.query.providers.findMany()

            if (providers.length == 0) {
                await this.drizzleService.db.insert(databaseSchema.providers)
                    .values([
                        { name: 'Aetna' },
                        { name: 'United' },
                        { name: 'Blue Cross' },
                    ])
                return await this.drizzleService.db.query.providers.findMany()
            } else {
                return providers
            }
        } catch (error) {
            console.log(error)
            throw error
        }
    }


}
