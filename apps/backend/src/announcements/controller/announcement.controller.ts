import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AnnouncementService } from '../service/announcement.service';
import { FirebaseAuthGuard } from '../../common/firebase/firebase.auth.guard';
import { RoleGuard } from '../../common/authorization/role.guard';
import { Roles } from '../../common/authorization/roles.decorator';

@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard, RoleGuard)
  @Roles('admin')
  async create(@Body() body: { title: string; message: string }) {
    return this.announcementService.create(body.title, body.message);
  }

  @Get()
  async getAll() {
    return this.announcementService.getAll();
  }
}
