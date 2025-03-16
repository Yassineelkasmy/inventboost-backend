
import { defineConfig } from 'drizzle-kit';
import { ConfigService } from '@nestjs/config';
import 'dotenv/config';

const configService = new ConfigService();

export default defineConfig({
    schema: './src/database/database.schema.ts',
    out: './drizzle/inventboost',
    dialect: 'postgresql',
    dbCredentials: {
        host: configService.get<string>('DB_HOST')!,
        port: configService.get<number>('DB_PORT')!,
        user: configService.get<string>('DB_USER')!,
        password: configService.get<string>('DB_PASSWORD')!,
        database: configService.get<string>('DB_NAME')!,
        ssl: false,
    },
})