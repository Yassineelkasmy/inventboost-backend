import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserController } from './user.controller';

@Module({
  providers: [UserService],
  imports: [AuthModule],
  controllers: [UserController]
})
export class UserModule { }
