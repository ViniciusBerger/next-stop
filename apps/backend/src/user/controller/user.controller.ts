import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { FirebaseAuthGuard } from "../../common/firebase/firebase.auth.guard";
import { UserService } from "../service/user.service";
import { UserResponseDTO } from "../DTOs/user.response.DTO";
import { UpdateUserDTO } from "../DTOs/update.user.DTO";
import { DeleteUserDTO } from "../DTOs/delete.user.DTO";
import { GetUserDTO } from "../DTOs/get.user.DTO";
import { plainToInstance } from "class-transformer";

@UseGuards(FirebaseAuthGuard)
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('me/push-token')
  async savePushToken(@Req() req, @Body() body: { expoPushToken: string }) {
    return this.userService.savePushToken(req.user.uid, body.expoPushToken);
  }

  @Patch('me/wishlist/:placeId')
  async toggleWishlist(@Req() req, @Param('placeId') placeId: string) {
    return this.userService.toggleArrayField(req.user.uid, 'wishlist', placeId);
  }

  @Patch('me/favorites/:placeId')
  async toggleFavorite(@Req() req, @Param('placeId') placeId: string) {
    return this.userService.toggleArrayField(req.user.uid, 'favorites', placeId);
  }

  @Get('me/wishlist')
  async getWishlist(@Req() req) {
    return this.userService.getArrayField(req.user.uid, 'wishlist');
  }

  @Get('me/favorites')
  async getFavorites(@Req() req) {
    return this.userService.getArrayField(req.user.uid, 'favorites');
  }

    /**
   * Retrieves a single user. 
   * Maps :firebaseUid from URL to GetUserDTO and extracts it for the service.
   * 
   * @return userResponseDTO
   */
  @Get(':firebaseUid')
  async findOne(@Param() params: GetUserDTO) {
    const {firebaseUid, username} = params;
    let user;

    if (firebaseUid) user = await this.userService.findById(firebaseUid as GetUserDTO);
    if (username) user = await this.userService.findByUsername(username as GetUserDTO);

    if (!user) throw new NotFoundException(`User with ${params} was not found`);
    return plainToInstance(UserResponseDTO, user.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  

  /**
   * Updates user profile data.
   * Identity is taken from the Auth Guard (req.user), logic data from Body DTO.
   * 
   * @return userResponseDTO
   */
  @Patch()
  async updateUser(@Req() req, @Body() updateUserDTO: UpdateUserDTO) {
    const updatedUser = await this.userService.updateUser(req.user.uid, updateUserDTO);
    return plainToInstance(UserResponseDTO, updatedUser.toObject(), { // ✅ fixed
      excludeExtraneousValues: true,
    });
  }

  /**
   * Deletes a user by UID.
   * Note: The param name ':firebaseUid' must match the property in DeleteUserDTO.
   * 
   * @return userResponseDTO
   */

  @Delete(':firebaseUid')
  async deleteUser(@Param() params: DeleteUserDTO) {
    const deletedUser = await this.userService.deleteUser(params);
    return plainToInstance(UserResponseDTO, deletedUser.toObject(), { // ✅ fixed
      excludeExtraneousValues: true,
    });
  }
}