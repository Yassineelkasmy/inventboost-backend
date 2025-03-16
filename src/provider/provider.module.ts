import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { ProviderController } from './provider.controller';
import { ProviderService } from './provider.service';

@Module({
    controllers: [ProviderController],
    providers: [ProviderService]
})
export class ProviderModule { }
