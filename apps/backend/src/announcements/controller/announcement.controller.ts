import { Body, Controller, Get, Post } from '@nestjs/common';
import { AnnouncementService } from '../service/announcement.service';

@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post()
  async create(@Body() body: { title: string; message: string }) {
    return this.announcementService.create(body.title, body.message);
  }

  @Get()
  async getAll() {
    return this.announcementService.getAll();
  }
}
