import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { UserService } from "../service/user.service";
import { GetUserDTO } from "../DTOs/get.user.DTO";
import { UserResponseDTO } from "../DTOs/user.response.DTO";
import { UpdateUserDTO } from "../DTOs/update.user.DTO";
import { AddFriendDTO } from "../DTOs/add.friend.DTO";
import { DeleteUserDTO } from "../DTOs/delete.user.DTO";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

    @Post('/user') 
    async createUser(@Body() createUserDTO: CreateUserDTO)  {
      const userAdded = await this.userService.createUser(createUserDTO);
      return new UserResponseDTO(userAdded);
    }

    @Get('/user')
    async getUser(@Query() getUserDTO: GetUserDTO) {
      const user = await this.userService.getUser(getUserDTO);
      if (!user) throw new NotFoundException(`User not found`);
      return new UserResponseDTO(user);
    }

    @Patch('/user')
    async updateUser(@Body() editUserDTO: EditUserDTO) {
      const updatedUser = await this.userService.updateUser(editUserDTO);
      return { message: new UserResponseDTO(updatedUser) };
    }

    @Delete(':firebaseUid')
    async deleteUser(@Param('firebaseUid') firebaseUid: string) {
      const deleteUserDTO: DeleteUserDTO = { firebaseUid };
      const deletedUser = await this.userService.deleteUser(deleteUserDTO);
      if (!deletedUser) throw new NotFoundException(`User not found`);
      return { message: new UserResponseDTO(deletedUser) };
    }

    // ============== FAVORITES ==============
    
    @Post(':userId/favorites')
    async addToFavorites(
      @Param('userId') userId: string, 
      @Body() body: { placeId: string }
    ) {
      const updatedUser = await this.userService.addToFavorites(userId, body.placeId);
      return { message: 'Place added to favorites', favorites: updatedUser.favorites };
    }

    @Get(':userId/favorites')
    async getFavorites(@Param('userId') userId: string) {
      const favorites = await this.userService.getFavorites(userId);
      return favorites;
    }

    @Delete(':userId/favorites/:placeId')
    async removeFromFavorites(
      @Param('userId') userId: string, 
      @Param('placeId') placeId: string
    ) {
      const updatedUser = await this.userService.removeFromFavorites(userId, placeId);
      return { message: 'Place removed from favorites', favorites: updatedUser.favorites };
    }

    // ============== WISHLIST ==============
    
    @Post(':userId/wishlist')
    async addToWishlist(
      @Param('userId') userId: string, 
      @Body() body: { placeId: string }
    ) {
      const updatedUser = await this.userService.addToWishlist(userId, body.placeId);
      return { message: 'Place added to wishlist', wishlist: updatedUser.wishlist };
    }

    @Get(':userId/wishlist')
    async getWishlist(@Param('userId') userId: string) {
      const wishlist = await this.userService.getWishlist(userId);
      return wishlist;
    }

    @Delete(':userId/wishlist/:placeId')
    async removeFromWishlist(
      @Param('userId') userId: string, 
      @Param('placeId') placeId: string
    ) {
      const updatedUser = await this.userService.removeFromWishlist(userId, placeId);
      return { message: 'Place removed from wishlist', wishlist: updatedUser.wishlist };
    }

    // ============== ADMIN - BAN/SUSPEND ==============
    // TODO: Add @UseGuards(AdminGuard) when authentication is implemented

    @Put('admin/:userId/ban')
    async banUser(
      @Param('userId') userId: string,
      @Body() body?: { reason?: string }
    ) {
      const bannedUser = await this.userService.banUser(userId, body?.reason);
      return { 
        message: 'User banned successfully',
        user: {
          username: bannedUser.username,
          isBanned: bannedUser.isBanned,
          bannedAt: bannedUser.bannedAt,
          banReason: bannedUser.banReason
        }
      };
    }

    @Put('admin/:userId/unban')
    async unbanUser(@Param('userId') userId: string) {
      const unbannedUser = await this.userService.unbanUser(userId);
      return { 
        message: 'User unbanned successfully',
        user: {
          username: unbannedUser.username,
          isBanned: unbannedUser.isBanned
        }
      };
    }

    @Put('admin/:userId/suspend')
    async suspendUser(
      @Param('userId') userId: string,
      @Body() body: { suspendedUntil: string, reason?: string }
    ) {
      const suspendedUser = await this.userService.suspendUser(
        userId, 
        new Date(body.suspendedUntil),
        body.reason
      );
      return { 
        message: 'User suspended successfully',
        user: {
          username: suspendedUser.username,
          isSuspended: suspendedUser.isSuspended,
          suspendedUntil: suspendedUser.suspendedUntil,
          banReason: suspendedUser.banReason
        }
      };
    }

    @Put('admin/:userId/unsuspend')
    async unsuspendUser(@Param('userId') userId: string) {
      const unsuspendedUser = await this.userService.unsuspendUser(userId);
      return { 
        message: 'User unsuspended successfully',
        user: {
          username: unsuspendedUser.username,
          isSuspended: unsuspendedUser.isSuspended
        }
      };
    }
}