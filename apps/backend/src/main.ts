import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { GlobalValidationPipe } from './common/validation.pipe';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


async function bootstrap() {
  console.log('App started');
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

    // ADD THIS ONLY ↓↓↓

const config = new DocumentBuilder()
.setTitle('NextStop API')
.setDescription('NextStop backend APIs')
.setVersion('1.0')
.build();

const document =
SwaggerModule.createDocument(app, config);

SwaggerModule.setup('api', app, document);

// END AD

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
