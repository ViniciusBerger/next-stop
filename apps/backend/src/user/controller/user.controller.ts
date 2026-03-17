import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { FirebaseAuthGuard } from "../../common/firebase/firebase.auth.guard";
import { UserService } from "../service/user.service";
import { UserResponseDTO } from "../DTOs/user.response.DTO";
import { UpdateUserDTO } from "../DTOs/update.user.DTO";
import { DeleteUserDTO } from "../DTOs/delete.user.DTO";
import { GetUserDTO } from "../DTOs/get.user.DTO";
import { plainToInstance } from "class-transformer";

<<<<<<< HEAD
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

=======
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
>>>>>>> 1ee85fd5e41c485704d95c5a7af5d997111b1711
}