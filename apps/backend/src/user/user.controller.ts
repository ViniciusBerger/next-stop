import { BadRequestException, Controller, Get, NotFoundException, Post, Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { GetUserDTO } from "./DTOs/get.user.DTO";

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

    // @Post('/user') 
    // async addUser() {
    //     const dummyUser = 
    // }
    // }

    // get user by firebaseUid

    
    @Get('/user')
    async getUser(@Query() getUserDTO: GetUserDTO) {

        const hasValues = Object.values(getUserDTO).some(value => value !== undefined && value !== '');

        if (!hasValues) {
        throw new BadRequestException('Please provide a valid name or firebaseUid');
        }
        
        const user = await this.userService.getUser(getUserDTO);
        if (!user) throw new NotFoundException(`User not found`);
        
        return user;
    }





}
