import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './schema/notification.schema';
import { NotificationController } from './controller/notification.controller';
import { NotificationService } from './service/notification.service';
import { NotificationRepository } from './repository/notification.repository';
import { User, userSchema } from '../user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Notification.name,
        schema: NotificationSchema,
        collection: 'Notification',
      },
      { name: User.name, schema: userSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationRepository],
  exports: [NotificationService],
})
export class NotificationModule {}
