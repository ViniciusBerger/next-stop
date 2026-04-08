import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './controller/event.controller';
import { EventService } from './service/event.service';
import { EventRepository } from './repository/event.repository';
import { Event, eventSchema } from './schema/event.schema';
import { BadgeModule } from '../badges/badge.module';
import { NotificationModule } from '../notifications/notification.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: eventSchema }]),
    BadgeModule,
    NotificationModule,
    UserModule,
  ],
  controllers: [EventController],
  providers: [EventService, EventRepository],
  exports: [EventService],
})
export class EventModule {}