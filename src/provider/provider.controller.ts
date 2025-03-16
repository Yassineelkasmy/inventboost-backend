import { Controller, Get } from '@nestjs/common';
import { ProviderService } from './provider.service';

@Controller('providers')
export class ProviderController {

    constructor(private readonly providersService: ProviderService) { }

    @Get()
    getProviders() {
        return this.providersService.getProviders()
    }
}
