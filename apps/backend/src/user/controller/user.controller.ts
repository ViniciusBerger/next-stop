import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Req, Query } from "@nestjs/common";
import { UserService } from "../service/user.service";
import { GetUserDTO } from "../DTOs/get.user.DTO";
import { UserResponseDTO } from "../DTOs/user.response.DTO";
import { UpdateUserDTO } from "../DTOs/update.user.DTO";
import { AddFriendDTO } from "../DTOs/add.friend.DTO";
import { DeleteUserDTO } from "../DTOs/delete.user.DTO";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

    
    @Get('/user')
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
    async deleteUser(@Param('firebaseUid') deleteUserDTO: DeleteUserDTO) {
      const deletedUser = await this.userService.deleteUser(deleteUserDTO);

      return {message: new UserResponseDTO(deletedUser)}
    }

    @Patch("/friend/add")
    async addFriend(@Req() req, @Body() addFriendDTO: AddFriendDTO) {
        return await this.userService.handleFriendRequest(req.user.uid, addFriendDTO);
    }





}
