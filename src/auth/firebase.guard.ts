import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { FirebaseService } from "./firebase.service";
import { SessionService } from "./session.service";

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    constructor(
        private firebaseService: FirebaseService,
        private sessionService: SessionService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        return this.validateRequest(request);
    }

    async validateRequest(req: any): Promise<boolean> {
        const token = req.headers.authorization;


        let user = await this.sessionService.getSession(token)

        if (!user) {
            if (token != null && token != '') {
                try {
                    const decodedToken = await this.firebaseService.defaultApp
                        .auth()
                        .verifyIdToken(token.replace('Bearer ', ''));


                    user = {
                        uid: decodedToken.uid,
                        email: decodedToken.email,
                    }
                    await this.sessionService.setSession(token, user)
                } catch (_) {
                    return false;
                }
            } else {
                return false;
            }
        }

        req.user = user;
        return true;
    }
}