import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './errors/global.error.filter';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [

    // configuration module to inject environment variables
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', // ./backend/.env
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_DB_STRING_CONNECTION'), // Pulls from .env
      }),
    }),
    ProfileModule,
  ],


  controllers: [AppController],
  

  //providers are services that the module provides
  providers: [
    AppService, 
    {
      // Global exception filter to handle errors across app
      provide: `APP_FILTER`,
      useClass: GlobalExceptionFilter
    }
  ], 
})
export class AppModule {}
