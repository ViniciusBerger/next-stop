import { Body, Controller, Post, Query } from "@nestjs/common";
import { AuthService } from "../service/auth.service";
import { UserResponseDTO } from "src/user/DTOs/user.response.DTO";
import { RegisterUserDTO } from "../DTOs/register.user.DTO";
import { ValidateUserDTO } from "../DTOs/validate.user.DTO";

@Controller('/auth')
export class AuthController {

    constructor(private authService:AuthService) {}

    @Post('/register')
    async register(@Body() registerUserDTO: RegisterUserDTO) {
        const user = await this.authService.handleRegister(registerUserDTO)
        return new UserResponseDTO(user)
    }

    @Post("/validate")
    async validate(@Body() validateUserDTO: ValidateUserDTO) {
        const user = await this.authService.handleValidate(validateUserDTO)
        return new UserResponseDTO(user)

    }
}