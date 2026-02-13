import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from '../common/errors/global.error.filter';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { PlaceModule } from '../places/place.module';
import { AuthModule } from 'src/auth/authentication/auth.module';
import { MongooseConnectionModule } from 'src/common/mongoose';
import { FirebaseModule } from 'src/common/firebase/firebase.admin';
import { ReviewModule } from 'src/reviews/review.module';
import { EventModule } from 'src/events/event.module';
import { ReportModule } from 'src/reports/report.module';
import { FriendsModule } from 'src/friends/friends.module';

@Module({
  imports: [
    // configuration module to inject environment variables
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', // ./backend/.env
    }),

    // mongoose module to connect to MongoDB
    MongooseConnectionModule.init(),
    UserModule, 
    PlaceModule,
    FirebaseModule,
    AuthModule,
    ReviewModule,
    EventModule,
    ReportModule,
    FriendsModule,
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
