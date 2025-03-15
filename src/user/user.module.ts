import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserController } from './user.controller';
import { FirebaseService } from 'src/auth/firebase.service';

@Module({
  providers: [UserService, FirebaseService],
  imports: [AuthModule],
  controllers: [UserController]
})
export class UserModule { }
