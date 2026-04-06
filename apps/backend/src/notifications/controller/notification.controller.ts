import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { NotificationService } from '../service/notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private service: NotificationService) {}

  @Get()
  getNotifications(@Query('userId') userId: string) {
    return this.service.getByRecipient(userId);
  }

  @Get('unread-count')
  getUnreadCount(@Query('userId') userId: string) {
    return this.service.getUnreadCount(userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }

  @Patch('read-all')
  markAllAsRead(@Query('userId') userId: string) {
    return this.service.markAllAsRead(userId);
  }
}
