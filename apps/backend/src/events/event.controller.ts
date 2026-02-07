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
  Headers,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDTO } from './DTOs/create.event.DTO';
import { UpdateEventDTO } from './DTOs/update.event.DTO';
import { GetEventDTO } from './DTOs/get.event.DTO';
import { AttendEventDTO } from './DTOs/attend.event.DTO';
import { InviteEventDTO } from './DTOs/invite.event.DTO';
import { plainToInstance } from 'class-transformer';
import { EventResponseDTO } from './DTOs/event.response.DTO';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // POST /events - Create a new event
  @Post()
  async createEvent(@Body() createEventDTO: CreateEventDTO) {
    const newEvent = await this.eventService.createEvent(createEventDTO);

    return plainToInstance(EventResponseDTO, newEvent.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  // GET /events - Get all events (with optional filters)
  @Get()
  async getEvents(@Query() getEventDTO?: GetEventDTO) {
    const events = await this.eventService.getAllEvents(getEventDTO);

    return events.map(event =>
      plainToInstance(EventResponseDTO, event.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }

  // GET /events/:id - Get a specific event by ID
  @Get(':id')
  async getEvent(
    @Param('id') id: string,
    @Headers('user-id') userId?: string, // Optional: for access control
  ) {
    const event = await this.eventService.getEvent(id, userId);

    return plainToInstance(EventResponseDTO, event.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  // GET /events/user/:userId - Get events created by or attended by user
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

  // PUT /events/:id - Update event (host only)
  @Put(':id')
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDTO: UpdateEventDTO,
    @Headers('user-id') userId: string, // Required: to verify host
  ) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const updatedEvent = await this.eventService.updateEvent(id, userId, updateEventDTO);

    return plainToInstance(EventResponseDTO, updatedEvent.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  // DELETE /events/:id - Delete event (host only)
  @Delete(':id')
  async deleteEvent(
    @Param('id') id: string,
    @Headers('user-id') userId: string, // Required: to verify host
  ) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    return await this.eventService.deleteEvent(id, userId);
  }

  // POST /events/:id/attend - Toggle RSVP (confirm/cancel attendance)
  @Post(':id/attend')
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

  // POST /events/:id/invite - Invite friends (host only)
  @Post(':id/invite')
  async inviteFriends(
    @Param('id') eventId: string,
    @Body() body: { friendIds: string[] },
    @Headers('user-id') userId: string, // Required: to verify host
  ) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const updatedEvent = await this.eventService.inviteFriends(
      { eventId, friendIds: body.friendIds },
      userId,
    );

    return plainToInstance(EventResponseDTO, updatedEvent.toObject(), {
      excludeExtraneousValues: true,
    });
  }
}