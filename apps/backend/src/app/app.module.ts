import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from '../common/errors/global.error.filter';
import { MongooseModule } from '@nestjs/mongoose';
<<<<<<< HEAD
import { UserModule } from 'src/user/user.module';
import { PlaceModule } from 'src/places/place.module';
import { SystemModule } from 'src/system/system.module';
import { FriendsModule } from 'src/friends/friends.module'; 
import { RecommendationModule } from '../recommendations/recommendation.module';
import { FeedbackModule } from '../feedback/feedback.module';
import { BadgesModule } from '../badges/badges.module';   // ← ADD THIS
=======
import { UserModule } from '../user/user.module';
import { PlaceModule } from '../places/place.module';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseConnectionModule } from 'src/common/mongoose';
import { FirebaseModule } from 'src/common/firebase/firebase.admin';
import { ReviewModule } from 'src/reviews/review.module';
import { EventModule } from 'src/events/event.module';
import { ReportModule } from 'src/reports/report.module';
import { ProfileModule } from 'src/profile/profile.module';
// Comment to push a change and test an update to render deployment
>>>>>>> 1ee85fd5e41c485704d95c5a7af5d997111b1711

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

<<<<<<< HEAD
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
    FriendsModule,
    RecommendationModule,
    FeedbackModule,
    BadgesModule   
=======
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
>>>>>>> 1ee85fd5e41c485704d95c5a7af5d997111b1711
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