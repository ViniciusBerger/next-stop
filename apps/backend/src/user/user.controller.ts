import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { GetUserDTO } from "./DTOs/get.user.DTO";
import { UserResponseDTO } from "./DTOs/user.response.DTO";
import { CreateUserDTO } from "./DTOs/create.user.DTO";
import { EditUserDTO } from "./DTOs/edit.user.DTO";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

    @Post('/') 
    async addUser(@Body() createUserDTO: CreateUserDTO )  {
      const userAdded = await this.userService.addUser(createUserDTO)

      return new UserResponseDTO(userAdded)
    }

    
    @Get('/user')
    async getUser(@Query() getUserDTO: GetUserDTO) {
        
      const hasValues = Object.values(getUserDTO).some(value => value !== undefined && value !== '');
      if (!hasValues) throw new BadRequestException('Please provide a valid name or firebaseUid');
        
      const user = await this.userService.getUser(getUserDTO);
      if (!user) throw new NotFoundException(`User not found`);
        
      return new UserResponseDTO(user);
    }


    @Patch('/user')
    async editUser(@Body() editUserDTO: EditUserDTO) {
      const updateUser = await this.userService.editUser(editUserDTO);

      if (!updateUser) return new NotFoundException(`User not found`);

      return {message: new UserResponseDTO(updateUser)
      };
      
    }

    @Delete(':id')
    async deleteUser(@Param('id') _id: string) {
      const deletedUser = await this.userService.deleteUser(_id);

      if (!deletedUser) return new NotFoundException(`User not found`);

      return {message: new UserResponseDTO(deletedUser)}
    }





}
