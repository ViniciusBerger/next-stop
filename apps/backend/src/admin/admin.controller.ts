import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { FirebaseAuthGuard } from "../common/firebase/firebase.auth.guard";
import { EventService } from "../events/service/event.service";
import { EventResponseDTO } from "../events/DTOs/event.response.DTO";
import { UserService } from "../user/service/user.service";
import { ModerationUserDTO } from "../user/DTOs/moderation.user.DTO";

/**
 * AdminController handles high-privileged operations including
 * managing user statuses and listing events.
 */
@Controller('admin')
@UseGuards(FirebaseAuthGuard)
export class AdminController {
    constructor(
        private readonly eventService: EventService,
        private readonly userService: UserService,
    ) {}

    /**
     * Retrieves all users with moderation fields.
     * GET /admin/users
     */
    @Get('users')
    async getUsers() {
        const users = await this.userService.getAll();
        // findAll() uses lean() so results are plain objects — no .toObject() needed
        return users.map(user =>
            plainToInstance(ModerationUserDTO, user, { excludeExtraneousValues: true }),
        );
    }

    /**
     * Bans a user permanently.
     * PATCH /admin/users/:firebaseUid/ban
     */
    @Patch('users/:firebaseUid/ban')
    async banUser(
        @Param('firebaseUid') firebaseUid: string,
        @Body() body: { reason?: string },
    ) {
        const user = await this.userService.banUser(firebaseUid, body.reason);
        const obj = user.toObject();
        obj._id = obj._id.toString();
        return plainToInstance(ModerationUserDTO, obj, { excludeExtraneousValues: true });
    }

    /**
     * Lifts a ban from a user.
     * PATCH /admin/users/:firebaseUid/unban
     */
    @Patch('users/:firebaseUid/unban')
    async unbanUser(@Param('firebaseUid') firebaseUid: string) {
        const user = await this.userService.unbanUser(firebaseUid);
        const obj = user.toObject();
        obj._id = obj._id.toString();
        return plainToInstance(ModerationUserDTO, obj, { excludeExtraneousValues: true });
    }

    /**
     * Suspends a user for a set number of days.
     * PATCH /admin/users/:firebaseUid/suspend
     */
    @Patch('users/:firebaseUid/suspend')
    async suspendUser(
        @Param('firebaseUid') firebaseUid: string,
        @Body() body: { days: number; reason?: string },
    ) {
        const user = await this.userService.suspendUser(firebaseUid, body.days, body.reason);
        const obj = user.toObject();
        obj._id = obj._id.toString();
        return plainToInstance(ModerationUserDTO, obj, { excludeExtraneousValues: true });
    }

    /**
     * Lifts a suspension from a user.
     * PATCH /admin/users/:firebaseUid/unsuspend
     */
    @Patch('users/:firebaseUid/unsuspend')
    async unsuspendUser(@Param('firebaseUid') firebaseUid: string) {
        const user = await this.userService.unsuspendUser(firebaseUid);
        const obj = user.toObject();
        obj._id = obj._id.toString();
        return plainToInstance(ModerationUserDTO, obj, { excludeExtraneousValues: true });
    }

    /**
     * Lists all events (admin view).
     * GET /admin/events
     */
    @Get('events')
    async getEvents() {
        const events = await this.eventService.getAllEvents();
        return events.map(event =>
            plainToInstance(EventResponseDTO, event.toObject(), {
                excludeExtraneousValues: true,
            }),
        );
    }
}
