import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { RequestUser } from 'src/auth/auth.types';
import { FirebaseAuthGuard } from 'src/auth/firebase.guard';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }


    @Post('check-email-already-exists')
    async checkEmailAlreadyExsists(@Body() req: { email: string }) {
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
            uid?: string

        },

    ) {
        return this.userService.createUser(req)
    }

    @UseGuards(FirebaseAuthGuard)
    @Get()
    async getCurerentUser(@CurrentUser() user: RequestUser) {
        return this.userService.getUserByExtAuthId(user.uid)
    }


    @UseGuards(FirebaseAuthGuard)
    @Post('/sync')
    async addUserBenefits(
        @Body() req: {
            provider: string
            memberId: string
            groupNumber: string
        },
        @CurrentUser() user: RequestUser
    ) {
        return this.userService.addBenefitsDeatails({
            ...req,
            uid: user.uid,
        })
    }
}
