import { Injectable } from '@nestjs/common';
import { RequestUser } from 'src/auth/auth.types';
import { FirebaseService } from 'src/auth/firebase.service';
import { databaseSchema } from 'src/database/database.schema';
import { DrizzleService } from 'src/database/drizzle.service';

interface CreateUserParams {
    email: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    accessCode: string,
    password?: string
    requestUser?: RequestUser
}

@Injectable()
export class UserService {
    constructor(
        private readonly drizzleService: DrizzleService,
        private readonly firebaseService: FirebaseService,
    ) { }


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

        }
    }



}
