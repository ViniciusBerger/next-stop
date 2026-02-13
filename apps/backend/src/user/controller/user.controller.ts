import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { GetUserDTO } from '../DTOs/get.user.DTO';
import { UserResponseDTO } from '../DTOs/user.response.DTO';
import { CreateUserDTO } from '../DTOs/create.user.DTO';
import { EditUserDTO } from '../DTOs/edit.user.DTO';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ----- USERS (RESTful) -----

  @Post()
  async createUser(@Body() dto: CreateUserDTO) {
    const user = await this.userService.createUser(dto);
    return new UserResponseDTO(user);
  }

  // Permite busca por firebaseUid OU username via query (?firebaseUid=... | ?username=...)
  @Get()
  async getUser(@Query() query: GetUserDTO) {
    const user = await this.userService.getUser(query);
    if (!user) throw new NotFoundException('User not found');
    return new UserResponseDTO(user);
  }

  @Patch(':firebaseUid')
  async updateUser(
    @Param('firebaseUid') firebaseUid: string,
    @Body() dto: EditUserDTO,
  ) {
    const updated = await this.userService.updateUser({
      ...dto,
      firebaseUid,
    });
    return new UserResponseDTO(updated);
  }

  @Delete(':firebaseUid')
  async deleteUser(@Param('firebaseUid') firebaseUid: string) {
    const deleted = await this.userService.deleteUser(firebaseUid);
    if (!deleted) throw new NotFoundException('User not found');
    return new UserResponseDTO(deleted);
  }

  // ----- FAVORITES -----

  @Post(':firebaseUid/favorites')
  async addToFavorites(
    @Param('firebaseUid') firebaseUid: string,
    @Body() body: { placeId: string },
  ) {
    if (!body?.placeId) throw new BadRequestException('placeId is required');
    const updated = await this.userService.addToFavorites(
      firebaseUid,
      body.placeId,
    );
    return { message: 'Place added to favorites', favorites: updated.favorites };
  }

  @Get(':firebaseUid/favorites')
  async getFavorites(@Param('firebaseUid') firebaseUid: string) {
    return this.userService.getFavorites(firebaseUid);
  }

  @Delete(':firebaseUid/favorites/:placeId')
  async removeFromFavorites(
    @Param('firebaseUid') firebaseUid: string,
    @Param('placeId') placeId: string,
  ) {
    const updated = await this.userService.removeFromFavorites(
      firebaseUid,
      placeId,
    );
    return {
      message: 'Place removed from favorites',
      favorites: updated.favorites,
    };
  }

  // ----- WISHLIST -----

  @Post(':firebaseUid/wishlist')
  async addToWishlist(
    @Param('firebaseUid') firebaseUid: string,
    @Body() body: { placeId: string },
  ) {
    if (!body?.placeId) throw new BadRequestException('placeId is required');
    const updated = await this.userService.addToWishlist(
      firebaseUid,
      body.placeId,
    );
    return { message: 'Place added to wishlist', wishlist: updated.wishlist };
  }

  @Get(':firebaseUid/wishlist')
  async getWishlist(@Param('firebaseUid') firebaseUid: string) {
    return this.userService.getWishlist(firebaseUid);
  }

  @Delete(':firebaseUid/wishlist/:placeId')
  async removeFromWishlist(
    @Param('firebaseUid') firebaseUid: string,
    @Param('placeId') placeId: string,
  ) {
    const updated = await this.userService.removeFromWishlist(
      firebaseUid,
      placeId,
    );
    return {
      message: 'Place removed from wishlist',
      wishlist: updated.wishlist,
    };
  }

  // ----- ADMIN -----

  @Put('admin/:firebaseUid/ban')
  async banUser(
    @Param('firebaseUid') firebaseUid: string,
    @Body() body?: { reason?: string },
  ) {
    const banned = await this.userService.banUser(firebaseUid, body?.reason);
    return {
      message: 'User banned successfully',
      user: {
        username: banned.username,
        isBanned: banned.isBanned,
        bannedAt: banned.bannedAt,
        banReason: banned.banReason,
      },
    };
  }

  @Put('admin/:firebaseUid/unban')
  async unbanUser(@Param('firebaseUid') firebaseUid: string) {
    const unbanned = await this.userService.unbanUser(firebaseUid);
    return {
      message: 'User unbanned successfully',
      user: {
        username: unbanned.username,
        isBanned: unbanned.isBanned,
      },
    };
  }

  @Put('admin/:firebaseUid/suspend')
  async suspendUser(
    @Param('firebaseUid') firebaseUid: string,
    @Body() body: { suspendedUntil: string; reason?: string },
  ) {
    const suspended = await this.userService.suspendUser(
      firebaseUid,
      new Date(body.suspendedUntil),
      body.reason,
    );
    return {
      message: 'User suspended successfully',
      user: {
        username: suspended.username,
        isSuspended: suspended.isSuspended,
        suspendedUntil: suspended.suspendedUntil,
        suspensionReason: suspended.suspensionReason,
      },
    };
  }

  @Put('admin/:firebaseUid/unsuspend')
  async unsuspendUser(@Param('firebaseUid') firebaseUid: string) {
    const unsuspended = await this.userService.unsuspendUser(firebaseUid);
    return {
      message: 'User unsuspended successfully',
      user: {
        username: unsuspended.username,
        isSuspended: unsuspended.isSuspended,
      },
    };
  }

  // ----- ALIASES DEPRECATED (opcional) -----
  // Se o FE ainda chama /users/user, você pode manter temporariamente:
  // @Post('user') createUserAlias(@Body() dto: CreateUserDTO) { return this.createUser(dto); }
  // @Get('user') getUserAlias(@Query() q: GetUserDTO) { return this.getUser(q); }
  // @Patch('user') updateUserAlias(@Body() dto: EditUserDTO) { return this.updateUser(dto.firebaseUid, dto); }
}