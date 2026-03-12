import { Body, Controller, Get, Param, Patch, Put, Query, Req, UseGuards } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { ReportResponseDTO } from "../reports/DTOs/report.response.DTO";
import { ReportService } from "../reports/service/report.service";
import { FirebaseAuthGuard } from "../common/firebase/firebase.auth.guard";
import { GetEventDTO } from "../events/DTOs/get.event.DTO";
import { EventService } from "../events/service/event.service";
import { EventResponseDTO } from "../events/DTOs/event.response.DTO";
import { UserService } from "../user/service/user.service";
import { UpdateUserDTO } from "src/user/DTOs/update.user.DTO";
import { UserResponseDTO } from "src/user/DTOs/user.response.DTO";
import { Roles } from "src/common/authorization/roles.decorator";

/**
 * AdminController handles high-privileged operations including 
 * managing reports, events, and user statuses.
 */
@Controller('admin')
@Roles('admin')
@UseGuards(FirebaseAuthGuard) // Protects all routes in this controller via Firebase
export class AdminController {
    constructor (
        private readonly reportService: ReportService,
        private readonly eventService: EventService,
        private readonly userService: UserService
    ){}

    /**
     * Marks a specific report as 'completed' in the database.
     * @param id The MongoDB ObjectId of the report
     * @returns A sanitized ReportResponseDTO
     */
    @Put(':id/complete')
    async completeReport(@Param('id') id: string) {
        const completedReport = await this.reportService.completeReport(id);
    
        // Convert Mongoose document to plain object and strip non-exposed values
        return plainToInstance(ReportResponseDTO, completedReport.toObject(), {
            excludeExtraneousValues: true,
        });
    }

    /**
     * Retrieves a list of all events.
     * Supports filtering via GetEventDTO query parameters.
     */
    @Get('events')
    async getEvents(@Query() getEventDTO?: GetEventDTO) {
        const events = await this.eventService.getAllEvents(getEventDTO);
      
        // Map through array to transform each document individually
        return events.map(event =>
            plainToInstance(EventResponseDTO, event.toObject(), {
                excludeExtraneousValues: true,
            }),
        );
    }

    /**
     * Retrieves a list of all registered users.
     * Note: As discussed, this fetches the entire collection.
     */
    @Get('users')
    async getUsers() {
        const users = await this.userService.getAll();
      
        return users.map(user =>
            plainToInstance(UserResponseDTO, user.toObject(), {
                excludeExtraneousValues: true,
            }),
        );
    }

    /**
     * Updates user status to 'banned'.
     * @note Logic relies on the service handling the 'isBanned' flag within the DTO.
     */
    @Patch('ban')
    async banUser(@Body() updateUserDTO: UpdateUserDTO) {
        const bannedUser = await this.userService.updateUser(updateUserDTO.id ?? "", updateUserDTO);
        return plainToInstance(UserResponseDTO, bannedUser.toObject(), { excludeExtraneousValues: true });
    }

    /**
     * Reverts a user's ban status.
     */
    @Patch('unban')
    async unbanUser(@Body() updateUserDTO: UpdateUserDTO) {
        const returnedUser = await this.userService.updateUser(updateUserDTO.id ?? "", updateUserDTO);
        return plainToInstance(UserResponseDTO, returnedUser.toObject(), { excludeExtraneousValues: true });
    }
}