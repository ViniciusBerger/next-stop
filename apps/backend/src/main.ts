import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { ExceptionFactory } from './common/errors/exception.Factory';


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

  app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
    exposeUnsetFields: false, // This is the magic line
  },
    // --- Add these two lines for debugging ---
    disableErrorMessages: false, // Ensures messages are sent to the client

    exceptionFactory: (errors)=> {new ExceptionFactory().createException(errors)}
}));

  await app.listen(process.env.PORT ?? 3000);
}


bootstrap();
