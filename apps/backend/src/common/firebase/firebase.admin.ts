// src/firebase/firebase.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Global()
@Module({
  imports: [ConfigModule], // Make sure to import this
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      inject: [ConfigService], // Inject ConfigService
      useFactory: (configService: ConfigService) => {
        // Use configService.get() instead of process.env
        const clientEmail = configService.get<string>('FIREBASE_CLIENT_ID');
        const projectId = configService.get<string>('FIREBASE_PROJECT_ID');
        const privateKey = configService.get<string>('FIREBASE_PRIVATE_KEY');

        return admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey?.replace(/\\n/g, '\n'),
          }),
        });
      },
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {}