import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from './firebase.service';
import { SessionService } from './session.service';

@Module({
    imports: [ConfigModule],
    providers: [FirebaseService, SessionService],
    exports: [FirebaseService, SessionService],
})
export class AuthModule { }
