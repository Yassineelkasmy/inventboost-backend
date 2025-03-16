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
    requestUser?: RequestUser
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
        this.bucketName = this.configService.get<string>('BLINKY_AWS_BUCKET_NAME')!;
        this.s3Client = new S3Client({
            region: this.configService.get<string>('BLINKY_AWS_REGION')!,
            credentials: {
                accessKeyId: this.configService.get<string>('BLINKY_AWS_ACCESS_KEY_ID')!,
                secretAccessKey: this.configService.get<string>('BLINKY_AWS_SECRET_ACCESS_KEY')!,
            },
        });
    }


    async isEmailAlreadyExsists(email: string) {
        const user = await this.drizzleService.db.query.users.findFirst({ where: (fields, { eq }) => eq(fields.email, email) })
        return Boolean(user)
    }


    async createUser(params: CreateUserParams) {

        try {
            const { uid } = params?.requestUser ?? await this.firebaseService.defaultApp.auth().createUser({
                email: params.email,
                password: params.password,
            })

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

        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException()
        }
    }


    async getUserByExtAuthId(extAuthId: string) {
        const user = await this.drizzleService.db.query.users.findFirst({ where: (fields, { eq }) => eq(fields.extAuthId, extAuthId) })
        if (!user) {
            throw new NotFoundException()
        }
        return user
    }


    async addBenefitsDeatails(params: AddUserBenefitsDetailsParams) {
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
            const user = await this.getUserByExtAuthId(uid)

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



}
