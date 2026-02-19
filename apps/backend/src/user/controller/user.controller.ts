import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { FirebaseAuthGuard } from "../../common/firebase/firebase.auth.guard";
import { UserService } from "../service/user.service";
import { UserResponseDTO } from "../DTOs/user.response.DTO";
import { UpdateUserDTO } from "../DTOs/update.user.DTO";
import { DeleteUserDTO } from "../DTOs/delete.user.DTO";
import { GetUserDTO } from "../DTOs/get.user.DTO";

@UseGuards(FirebaseAuthGuard)
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Retrieves a single user. 
   * Maps :firebaseUid from URL to GetUserDTO and extracts it for the service.
   * 
   * @return userResponseDTO
   */
  @Get(':firebaseUid')
  async findOne(@Param() params: GetUserDTO) {
    const user = await this.userService.findOne(params);
    
    if (!user) {
      throw new NotFoundException(`User with UID ${params.firebaseUid} not found`);
    }
    
    return new UserResponseDTO(user);
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
    return new UserResponseDTO(updatedUser);
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
    return new UserResponseDTO(deletedUser);
  }
}