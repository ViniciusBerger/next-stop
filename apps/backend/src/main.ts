import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { GlobalValidationPipe } from './common/validation.pipe';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(GlobalValidationPipe);

  // app.enableCors({
  //     origin: ['http://localhost:8081'], // Only allow our specific Expo app
  //     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
