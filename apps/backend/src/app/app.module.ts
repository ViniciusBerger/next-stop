import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from '../common/errors/global.error.filter';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user/user.module';
import { PlaceModule } from 'src/places/place.module';
import { OutingModule } from 'src/outings/outing.module';

@Module({
  imports: [
    // configuration module to inject environment variables
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', // ./backend/.env
    }),

    // mongoose module to connect to MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_DB_STRING_CONNECTION'),
      }),
    }),

    
    UserModule, 
    PlaceModule,
    OutingModule,
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
