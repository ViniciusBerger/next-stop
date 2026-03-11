import { BadRequestException, Body, Controller, Post, Query } from "@nestjs/common";
import { AuthService } from "../service/auth.service";
import { UserResponseDTO } from "src/user/DTOs/user.response.DTO";
import { RegisterUserDTO } from "../DTOs/register.user.DTO";
import { ValidateUserDTO } from "../DTOs/validate.user.DTO";
import { plainToInstance } from "class-transformer";

@Controller('/auth')
export class AuthController {

    constructor(private authService:AuthService) {}

    @Post("/validate")
    async validate(@Body() validateUserDTO: ValidateUserDTO) {
    const user = await this.authService.handleValidate(validateUserDTO);
    if (!user) throw new BadRequestException('Validation failed');
    return plainToInstance(UserResponseDTO, user.toObject(), {
        excludeExtraneousValues: true,
    });
    }

    @Post('/register')
    async register(@Body() registerUserDTO: RegisterUserDTO) {
    const user = await this.authService.handleRegister(registerUserDTO);
    if (!user) throw new BadRequestException('Registration failed');
    return plainToInstance(UserResponseDTO, user.toObject(), {
        excludeExtraneousValues: true,
    });
    }
}