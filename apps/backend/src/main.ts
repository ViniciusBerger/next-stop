import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // initialize firebase admin SDK
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
      clientEmail: configService.get<string>('FIREBASE_CLIENT_ID'),
      privateKey: configService.get<string>('FIREBASE_PRIVATE_KEY'),
    })
  })

  app.enableCors({
      origin: ['http://localhost:8081'], // Only allow our specific Expo app
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    });

  await app.listen(process.env.PORT ?? 3000);
}


bootstrap();
