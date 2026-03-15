import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { GlobalValidationPipe } from './common/validation.pipe';
import { FirebaseAdmin } from './common/firebase';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const firebaseConfig = {
    projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
    clientEmail: configService.get<string>('FIREBASE_CLIENT_ID'),
    privateKey: configService.get<string>('FIREBASE_PRIVATE_KEY'),
  };

  // initialize firebase only if config exists
  if (
    firebaseConfig.projectId &&
    firebaseConfig.clientEmail &&
    firebaseConfig.privateKey
  ) {

    FirebaseAdmin.init(firebaseConfig);

  } else {

    console.warn('⚠ Firebase not configured. Skipping Firebase initialization');

  }

  app.useGlobalPipes(GlobalValidationPipe);

  // app.enableCors({
  //   origin: ['http://localhost:8081'],
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  // });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('NextStop API')
    .setDescription('NextStop backend API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);

}

bootstrap();