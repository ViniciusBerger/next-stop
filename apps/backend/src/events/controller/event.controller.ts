import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Put,
  Query,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../../common/firebase/firebase.auth.guard';
import { EventService } from '../service/event.service';
import { CreateEventDTO } from '../DTOs/create.event.DTO';
import { UpdateEventDTO } from '../DTOs/update.event.DTO';
import { GetEventDTO } from '../DTOs/get.event.DTO';
import { AttendEventDTO } from '../DTOs/attend.event.DTO';
import { InviteEventDTO } from '../DTOs/invite.event.DTO';
import { plainToInstance } from 'class-transformer';
import { EventResponseDTO } from '../DTOs/event.response.DTO';
import { NotificationService } from '../../notifications/service/notification.service';
import { NotificationType } from '../../notifications/schema/notification.schema';
import { UserService } from '../../user/service/user.service';

@Controller('events')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
  ) {}

  /**
   * Resolves the authenticated Firebase UID to a MongoDB _id
   */
  private async resolveUserId(req: any): Promise<string> {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) throw new BadRequestException('User not authenticated');
    const user = await this.userService.findById({ firebaseUid });
    if (!user) throw new NotFoundException('User not found');
    return user._id.toString();
  }

  /**
   * Creates a new event
   * POST /events
   */
  @Post()
  @UseGuards(FirebaseAuthGuard)
  async createEvent(@Body() createEventDTO: CreateEventDTO) {
    const newEvent = await this.eventService.createEvent(createEventDTO);

    if (createEventDTO.invitedFriends?.length) {
      for (const friendId of createEventDTO.invitedFriends) {
        await this.notificationService.create({
          recipient: friendId,
          sender: createEventDTO.host,
          type: NotificationType.EVENT_INVITE,
          message: `invited you to ${createEventDTO.name}`,
          relatedId: newEvent._id.toString(),
        });
      }
    }

    return plainToInstance(EventResponseDTO, newEvent.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Retrieves all events with optional filters
   * GET /events
   */
  @Get()
  async getEvents(@Query() getEventDTO?: GetEventDTO) {
    const events = await this.eventService.getAllEvents(getEventDTO);

    return events.map(event =>
      plainToInstance(EventResponseDTO, event.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }

  /**
   * Retrieves events created by or attended by user
   * GET /events/user/:userId
   */
  @Get('user/:userId')
  async getUserEvents(@Param('userId') userId: string) {
    const events = await this.eventService.getUserEvents(userId);

    return {
      created: events.created.map(event =>
        plainToInstance(EventResponseDTO, event.toObject(), {
          excludeExtraneousValues: true,
        }),
      ),
      attending: events.attending.map(event =>
        plainToInstance(EventResponseDTO, event.toObject(), {
          excludeExtraneousValues: true,
        }),
      ),
    };
  }


  /**
   * Retrieves a specific event
   * GET /events/:id
   */
  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  async getEvent(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const userId = await this.resolveUserId(req);
    const event = await this.eventService.getEvent(id, userId);

    return plainToInstance(EventResponseDTO, event.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Updates an event (host only)
   * PUT /events/:id
   */
  @Put(':id')
  @UseGuards(FirebaseAuthGuard)
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDTO: UpdateEventDTO,
    @Req() req: any,
  ) {
    const userId = await this.resolveUserId(req);
    const updatedEvent = await this.eventService.updateEvent(id, userId, updateEventDTO);

    return plainToInstance(EventResponseDTO, updatedEvent.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Deletes an event (host only)
   * DELETE /events/:id
   */
  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  async deleteEvent(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const userId = await this.resolveUserId(req);
    return await this.eventService.deleteEvent(id, userId);
  }

  /**
   * Toggles RSVP (confirm/cancel attendance)
   * POST /events/:id/attend
   */
  @Post(':id/attend')
  @UseGuards(FirebaseAuthGuard)
  async toggleAttendance(
    @Param('id') eventId: string,
    @Body() body: { userId: string },
  ) {
    const updatedEvent = await this.eventService.toggleAttendance({
      eventId,
      userId: body.userId,
    });

    return plainToInstance(EventResponseDTO, updatedEvent.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Invites friends (host only)
   * POST /events/:id/invite
   */
  @Post(':id/invite')
  @UseGuards(FirebaseAuthGuard)
  async inviteFriends(
    @Param('id') eventId: string,
    @Body() body: { friendIds: string[] },
    @Req() req: any,
  ) {
    const userId = await this.resolveUserId(req);
    const updatedEvent = await this.eventService.inviteFriends(
      { eventId, friendIds: body.friendIds },
      userId,
    );

    for (const friendId of body.friendIds) {
      await this.notificationService.create({
        recipient: friendId,
        sender: userId,
        type: NotificationType.EVENT_INVITE,
        message: `invited you to an event`,
        relatedId: eventId,
      });
    }

    return plainToInstance(EventResponseDTO, updatedEvent.toObject(), {
      excludeExtraneousValues: true,
    });
  }
}