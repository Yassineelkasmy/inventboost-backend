import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as serviceAccount from './secret.json';
import firebase from 'firebase-admin';
import { deleteApp, getApps, } from "firebase-admin/app";


const firebase_params = {
    type: serviceAccount.type,
    projectId: serviceAccount.project_id,
    privateKeyId: serviceAccount.private_key_id,
    privateKey: serviceAccount.private_key,
    clientEmail: serviceAccount.client_email,
    clientId: serviceAccount.client_id,
    authUri: serviceAccount.auth_uri,
    tokenUri: serviceAccount.token_uri,
    authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
    clientC509CertUrl: serviceAccount.client_x509_cert_url,
};


@Injectable()
export class FirebaseService implements OnModuleDestroy {
    public defaultApp!: firebase.app.App;

    constructor() {
        this.initializeFirebase();
    }

    private async initializeFirebase() {
        const apps = getApps();

        if (apps.length > 0) {
            await Promise.all(apps.map((app) => deleteApp(app)));
        }

        this.defaultApp = firebase.initializeApp({
            credential: firebase.credential.cert(firebase_params),
        });
    }

    async onModuleDestroy() {
        await Promise.all(getApps().map((app) => deleteApp(app)));
    }
}