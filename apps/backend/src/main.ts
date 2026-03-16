import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { GlobalValidationPipe } from './common/validation.pipe';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(GlobalValidationPipe);

  app.enableCors({
      // origin: [
      //   'http://localhost:8081',
      //   'https://localhost:8081',
      //   'http://localhost:19006',
      //   'https://next-stop-11pg.onrender.com', // Backend (for same-origin calls)
      //   /^https:\/\/.*\.expo\.dev$/,           // any Expo hosted URL
      //   /^exp:\/\/.*/,                         // Expo Go app
      // ], // Only allow select origins
      origin: '*', // Allow all origins (for development)
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
