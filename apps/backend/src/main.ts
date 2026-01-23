import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import admin from 'firebase-admin';
import ServiceAccountKey from '../serviceAccountKey.json';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  admin.initializeApp({
    credential: admin.credential.cert(ServiceAccountKey as admin.ServiceAccount)
  })

  app.enableCors({
      origin: ['http://localhost:8081'], // Only allow our specific Expo app
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    });

  await app.listen(process.env.PORT ?? 3000);
}


bootstrap();
