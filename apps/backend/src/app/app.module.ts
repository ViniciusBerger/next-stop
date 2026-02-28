import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from '../common/errors/global.error.filter';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user/user.module';
import { PlaceModule } from 'src/places/place.module';
import { SystemModule } from 'src/system/system.module'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_DB_STRING_CONNECTION'),
      }),
    }),

    UserModule,
    PlaceModule,
    SystemModule, 
  ],

  controllers: [AppController],

  providers: [
    AppService,
    {
      provide: `APP_FILTER`,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}