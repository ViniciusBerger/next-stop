import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { GlobalValidationPipe } from './common/validation.pipe';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(GlobalValidationPipe);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

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