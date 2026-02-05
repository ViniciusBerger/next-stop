import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { GlobalValidationPipe } from './common/validation.pipe';
import { FirebaseAdmin } from './common/firebase';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const firebaseConfig = {
      projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
      clientEmail: configService.get<string>('FIREBASE_CLIENT_ID'),
      privateKey: configService.get<string>('FIREBASE_PRIVATE_KEY'),
    }

  // initialize firebase admin SDK
  FirebaseAdmin.init(firebaseConfig);

  app.useGlobalPipes(GlobalValidationPipe);

  // app.enableCors({
  //     origin: ['http://localhost:8081'], // Only allow our specific Expo app
  //     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
