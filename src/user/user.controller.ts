import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { RequestUser } from 'src/auth/auth.types';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }


    @Post('check-email-already-exists')
    async checkEmailAlreadyExsists(@Body() req: { email: string }) {
        console.log(req.email)
        return this.userService.isEmailAlreadyExsists(req.email)
    }


    @Post('signup')
    async signUp(
        @Body() req: {
            email: string,
            firstName: string,
            lastName: string,
            phoneNumber: string,
            accessCode: string,
            password?: string

        },
        @CurrentUser() user?: RequestUser,
    ) {

    }
}
