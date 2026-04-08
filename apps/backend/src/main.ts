import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { GlobalValidationPipe } from './common/validation.pipe';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(GlobalValidationPipe);

  // Security headers (X-Frame-Options, HSTS, etc.)
  app.use(helmet());

  app.enableCors({
      origin: '*', // TODO: Restrict to production domains before launch
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
