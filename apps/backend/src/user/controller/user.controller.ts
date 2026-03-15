import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query } from "@nestjs/common";
import { UserService } from "../service/user.service";
import { GetUserDTO } from "../DTOs/get.user.DTO";
import { UserResponseDTO } from "../DTOs/user.response.DTO";
import { CreateUserDTO } from "../DTOs/create.user.DTO";
import { EditUserDTO } from "../DTOs/edit.user.DTO";
import { DeleteUserDTO } from "../DTOs/delete.user.DTO";

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Users')

@Controller("users")

export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/user')

  @ApiOperation({ summary: 'Create user' })

  @ApiResponse({ status: 201, description: 'User created successfully' })

  async createUser(@Body() createUserDTO: CreateUserDTO) {
    const userAdded = await this.userService.createUser(createUserDTO);
    return new UserResponseDTO(userAdded);
  }

  @Get('/user')

  @ApiOperation({ summary: 'Get user' })

  @ApiResponse({ status: 200, description: 'User returned successfully' })

  async getUser(@Query() getUserDTO: GetUserDTO) {
    const user = await this.userService.getUser(getUserDTO);
    if (!user) throw new NotFoundException(`User not found`);
    return new UserResponseDTO(user);
  }

  @Patch('/user')

  @ApiOperation({ summary: 'Update user' })

  @ApiResponse({ status: 200, description: 'User updated successfully' })

  async updateUser(@Body() editUserDTO: EditUserDTO) {
    const updateUser = await this.userService.updateUser(editUserDTO);
    return { message: new UserResponseDTO(updateUser) };
  }

  @Delete(':id')

  @ApiOperation({ summary: 'Delete user' })

  @ApiResponse({ status: 200, description: 'User deleted successfully' })

  async deleteUser(@Param('id') deleteUserDTO: DeleteUserDTO) {
    const deletedUser = await this.userService.deleteUser(deleteUserDTO);
    if (!deletedUser) throw new NotFoundException(`User not found`);
    return { message: new UserResponseDTO(deletedUser) };
  }

  @Get('/verify-email')

  @ApiOperation({ summary: 'Verify user email' })

  @ApiResponse({ status: 200, description: 'Email verified successfully' })

  async verifyEmail(@Query('token') token: string) {
    if (!token) throw new BadRequestException('Verification token is required');
    return await this.userService.verifyEmailToken(token);
  }

}