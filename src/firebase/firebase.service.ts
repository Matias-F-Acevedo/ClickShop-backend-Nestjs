import * as admin from "firebase-admin";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class FirebaseService {
    private readonly storage: admin.storage.Storage;

    constructor(private configService: ConfigService){

        const serviceAccount = this.configService.get<string>('config.firebase_service_account_path');
        const storageBucket = this.configService.get<string>('config.firebase_storage_bucket');


        admin.initializeApp({
            credential:admin.credential.cert(serviceAccount),
            storageBucket: storageBucket,
        });
        this.storage = admin.storage();
       
        
    }

    getStorageInstance(): admin.storage.Storage {
        return this.storage;
    }

}