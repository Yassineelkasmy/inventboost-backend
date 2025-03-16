import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import * as Joi from 'joi';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisOptions } from './configs/app-options';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseFormatInterceptor } from './response/response.interceptor';
import { ProviderModule } from './provider/provider.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        SERVER_PORT: Joi.number().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_HOST: Joi.string().required(),
      },
      ),
    }),
    DatabaseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => (
        {
          host: configService.get('DB_HOST')!,
          port: configService.get('DB_PORT')!,
          user: configService.get('DB_USER')!,
          password: configService.get('DB_PASSWORD')!,
          database: configService.get('DB_NAME')!,
        }
      ),
    }),
    CacheModule.registerAsync(RedisOptions),
    AuthModule,
    UserModule,
    ProviderModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseFormatInterceptor,
    },
  ]

})
export class AppModule { }
