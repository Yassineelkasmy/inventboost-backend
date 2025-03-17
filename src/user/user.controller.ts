import { BadRequestException, Body, Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { RequestUser } from 'src/auth/auth.types';
import { FirebaseAuthGuard } from 'src/auth/firebase.guard';
import { FileInterceptor } from '@nestjs/platform-express';


export enum DocumentFileType {
    PDF = 'application/pdf',
    XML = 'application/xml',
    JPG = 'image/jpeg',
    PNG = 'image/png',
}

const documentFileFilter = (req: any, file: Express.Multer.File, cb: Function) => {
    const allowedMimeTypes = Object.values(DocumentFileType);
    if (allowedMimeTypes.includes(file.mimetype as DocumentFileType)) {
        cb(null, true); // Accept the file
    } else {
        cb(
            new BadRequestException(
                `Invalid file type: ${file.originalname}. Allowed types: ${allowedMimeTypes.join(', ')}`
            ),
            false
        );
    }
}
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
        return this.userService.createUserAccount({
            ...req,

        })
    }


    @UseGuards(FirebaseAuthGuard)
    @Get()
    async getCurerentUser(@CurrentUser() user: RequestUser) {
        return this.userService.getUserByExtAuthId(user.uid, user.email)
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
        return this.userService.addBenefitsDetails({
            ...req,
            uid: user.uid,
        })
    }


    @Post('upload-benefit-card')
    @UseInterceptors(FileInterceptor('file', { fileFilter: documentFileFilter }))
    async uploadBenefitCard(
        @UploadedFile() documentFile: Express.Multer.File,
        @CurrentUser() user: RequestUser
    ) {
        return this.userService.uploadBenefitCard(user.uid, documentFile)
    }
}
