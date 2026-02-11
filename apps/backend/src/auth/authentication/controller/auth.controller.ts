import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "../service/auth.service";
import { UserResponseDTO } from "src/user/DTOs/user.response.DTO";
import { RegisterUserDTO } from "../DTOs/register.user.DTO";
import { ValidateUserDTO } from "../DTOs/validate.user.DTO";

@Controller('auth')
export class AuthController {

    constructor(private authService:AuthService) {}

    @Post('/register')
    async register(@Body() req: any) {
        const {provider, registerUserDTO} = req

        if(!provider) throw new BadRequestException("a provider is mandatory")
        
        const user = await this.authService.handleRegister(provider, registerUserDTO as RegisterUserDTO)
        
        return new UserResponseDTO(user)
    }

    @Post("/validate")
    async validate(@Body() req: any) {
        const {provider, validateUserDTO} = req

        if(!provider) throw new BadRequestException("a provider is mandatory")

        const user = await this.authService.handleValidate(provider, validateUserDTO as ValidateUserDTO)

        return new UserResponseDTO(user)

    }
}