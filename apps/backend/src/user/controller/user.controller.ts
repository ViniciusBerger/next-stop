import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query } from "@nestjs/common";
import { UserService } from "../service/user.service";
import { GetUserDTO } from "../DTOs/get.user.DTO";
import { UserResponseDTO } from "../DTOs/user.response.DTO";
import { CreateUserDTO } from "../DTOs/create.user.DTO";
import { EditUserDTO } from "../DTOs/edit.user.DTO";
import { DeleteUserDTO } from "../DTOs/delete.user.DTO";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

    @Post('/user') 
    async createUser(@Body() createUserDTO: CreateUserDTO )  {
      const userAdded = await this.userService.createUser(createUserDTO)

      return new UserResponseDTO(userAdded)
    }

    
    @Get('/user')
    async getUser(@Query() getUserDTO: GetUserDTO) {
        
      const user = await this.userService.getUser(getUserDTO);
      if (!user) throw new NotFoundException(`User not found`);
        
      return new UserResponseDTO(user);
    }


    @Patch('/user')
    async updateUser(@Body() editUserDTO: EditUserDTO) {
      const updateUser = await this.userService.updateUser(editUserDTO);

      return {message: new UserResponseDTO(updateUser)
      };
      
    }

    @Delete(':firebaseUid')
    async deleteUser(@Param('firebaseUid') deleteUserDTO: DeleteUserDTO) {
      const deletedUser = await this.userService.deleteUser(deleteUserDTO);

      if (!deletedUser) throw new NotFoundException(`User not found`);

      return {message: new UserResponseDTO(deletedUser)}
    }





}
