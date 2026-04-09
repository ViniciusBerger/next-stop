import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from '../common/errors/global.error.filter';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { PlaceModule } from '../places/place.module';
import { AuthModule } from '../auth/auth.module';
import { MongooseConnectionModule } from '../common/mongoose';
import { FirebaseModule } from '../common/firebase/firebase.admin';
import { ReviewModule } from '../reviews/review.module';
import { EventModule } from '../events/event.module';
import { ReportModule } from '../reports/report.module';
import { ProfileModule } from '../profile/profile.module';
import { FriendsModule }from '../friends/friends.module';
import { AiModule } from '../ai/ai.module';
import { SystemModule } from '../system/system.module';
import { AnnouncementModule } from '../announcements/announcement.module';
import { AdminModule } from '../admin/admin.module';
import { BadgeModule } from '../badges/badge.module';
import { NotificationModule } from '../notifications/notification.module';
// Comment to push a change and test an update to render deployment

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
    ProfileModule,
    FriendsModule,
    AiModule,
    SystemModule,
    AnnouncementModule,
    AdminModule,
    BadgeModule,
    NotificationModule
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
