import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { RequestUser } from 'src/auth/auth.types';
import { FirebaseService } from 'src/auth/firebase.service';
import { databaseSchema } from 'src/database/database.schema';
import { DrizzleService } from 'src/database/drizzle.service';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface CreateUserParams {
    email: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    accessCode: string,
    password?: string
    uid?: string
}

interface AddUserBenefitsDetailsParams {
    uid: string
    provider: string
    memberId: string
    groupNumber: string
}
@Injectable()
export class UserService {
    private s3Client: S3Client;
    private bucketName: string;
    constructor(
        private readonly drizzleService: DrizzleService,
        private readonly firebaseService: FirebaseService,
        private readonly configService: ConfigService,

    ) {
        this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME')!;
        this.s3Client = new S3Client({
            forcePathStyle: true,
            endpoint: this.configService.get<string>('AWS_ENDPOINT')!,
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,

            },
            region: this.configService.get<string>('AWS_REGION')!,


        });
    }


    async isEmailAlreadyExsists(email: string) {
        const user = await this.drizzleService.db.query.users.findFirst({ where: (fields, { eq }) => eq(fields.email, email) })
        return Boolean(user)
    }


    async createSocialLoginAccount(uid: string, email: string) {
        try {
            const [socialLoginUser] = await this.drizzleService.db.insert(databaseSchema.users)
                .values({
                    extAuthId: uid,
                    email: email,
                }).returning()

            return socialLoginUser
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async createUserAccount(params: CreateUserParams) {

        try {
            const uid = params.uid ?? (await this.firebaseService.defaultApp.auth().createUser({
                email: params.email,
                password: params.password,
            })).uid

            const existingUser = await this.drizzleService.db.query.users.findFirst({ where: (fields, { eq }) => eq(fields.extAuthId, uid) })

            if (existingUser) {

                const [updatedUser] = await this.drizzleService.db.update(databaseSchema.users)
                    .set({
                        firstName: params.firstName,
                        lastName: params.lastName,
                        phoneNumber: params.phoneNumber,
                        accessCode: params.accessCode
                    })
                    .where(eq(databaseSchema.users.extAuthId, uid))
                    .returning()

                return updatedUser

            } else {
                const [user] = await this.drizzleService.db.insert(databaseSchema.users)
                    .values({
                        extAuthId: uid,
                        email: params.email,
                        firstName: params.firstName,
                        lastName: params.lastName,
                        phoneNumber: params.phoneNumber,
                        accessCode: params.accessCode
                    }).returning()

                return user
            }

        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException()
        }
    }


    async getUserByExtAuthId(extAuthId: string, email: string) {
        try {
            const user = await this.drizzleService.db.query.users.findFirst({ where: (fields, { eq }) => eq(fields.extAuthId, extAuthId) })
            if (!user) {
                // Then user likely using a social login account
                const [socailLoginAccount] = await this.drizzleService.db.insert(databaseSchema.users)
                    .values({
                        extAuthId: extAuthId,
                        email: email
                    })
                    .returning()
                return socailLoginAccount
            }
            return user
        } catch (e) {
            throw new InternalServerErrorException('Error in getting user')
        }
    }


    async addBenefitsDetails(params: AddUserBenefitsDetailsParams) {
        try {
            const [updatedUser] = await this.drizzleService.db.update(databaseSchema.users)
                .set({
                    providerId: params.provider,
                    groupNumber: params.groupNumber,
                    memberId: params.memberId,
                })
                .where(eq(databaseSchema.users.extAuthId, params.uid))
                .returning()

            return updatedUser

        } catch (e) {
            console.log(e)
        }
    }

    async getBenefitCardDownloadUrl(uid: string): Promise<string> {
        try {
            const user = await this.drizzleService.db.query.users.findFirst({ where: (fields, { eq }) => eq(fields.extAuthId, uid) })

            if (!user || !user.benefitCard) {
                throw new NotFoundException('Benefit card not found');
            }

            const fileKey = user.benefitCard;

            const signedUrl = await getSignedUrl(
                this.s3Client,
                new GetObjectCommand({
                    Bucket: this.bucketName,
                    Key: fileKey,
                }),
                { expiresIn: 3600 }
            );

            return signedUrl;
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Error generating download URL');
        }
    }


    async uploadBenefitCard(uid: string, file: Express.Multer.File): Promise<String> {
        try {
            const fileKey = `${uid}/${uuidv4()}_${file.originalname}`;

            await this.s3Client.send(new PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
                Body: file.buffer,
                ContentType: file.mimetype,
            }));

            await this.drizzleService.db.update(databaseSchema.users)
                .set({
                    benefitCard: fileKey,
                })
                .where(eq(databaseSchema.users.extAuthId, uid))

            return fileKey

        } catch (error) {
            console.log(error)
            throw error
        }
    }

    //This is for testing purposes
    async uploadBenefitCardMock(uid: string, file: Express.Multer.File): Promise<String> {
        try {
            const fileKey = `${uid}/${uuidv4()}_${file.originalname}`;

            await this.drizzleService.db.update(databaseSchema.users)
                .set({
                    benefitCard: fileKey,
                })
                .where(eq(databaseSchema.users.extAuthId, uid))

            return fileKey

        } catch (error) {
            console.log(error)
            throw error
        }
    }



}
