import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Req, Query, BadRequestException } from "@nestjs/common";
import { UseGuards } from "@nestjs/common";
import { FirebaseAuthGuard } from "src/common/firebase/firebase.auth.guard";
import { UserService } from "../service/user.service";
import { GetUserDTO } from "../DTOs/get.user.DTO";
import { UserResponseDTO } from "../DTOs/user.response.DTO";
import { UpdateUserDTO } from "../DTOs/update.user.DTO";
import { FriendRequestDTO } from "../DTOs/friend.request";
import { DeleteUserDTO } from "../DTOs/delete.user.DTO";

@UseGuards(FirebaseAuthGuard)
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

    
    @Get('/:uid')
    async getUser(@Query() getUserDTO: GetUserDTO) {
        
      const user = await this.userService.getUser(getUserDTO);
      if (!user) throw new NotFoundException(`User not found`);
        
      return new UserResponseDTO(user);
    }


    @Patch('/user')
    async updateUser(@Body() updateUserDTO: UpdateUserDTO) {
      const updateUser = await this.userService.updateUser(updateUserDTO);
      return {message: new UserResponseDTO(updateUser)
      };
      
    }

    @Delete(':firebaseUid')
    async deleteUser(@Param('uid') deleteUserDTO: DeleteUserDTO) {
      const deletedUser = await this.userService.deleteUser(deleteUserDTO);

      return {message: new UserResponseDTO(deletedUser)}
    }

    @Patch("/friend")
    async addFriend(@Req() req, @Body() friendRequestDTO: FriendRequestDTO) {
        return await this.userService.handleFriendRequest(req.user.uid, friendRequestDTO);
    }

    @Delete("/friend/:uid")
    async deleteFriend(@Req() req, @Param('uid') uid: string) {
      return await this.userService.handleFriendDelete(req.user.uid, uid);
    }





}
