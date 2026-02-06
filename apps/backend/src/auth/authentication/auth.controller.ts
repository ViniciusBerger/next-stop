import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController {

    constructor(private authService:AuthService) {}

    @Post('/register')
    async register(@Body() body: any) {
        const { provider, ...registerUserAuthDTO } = body;

        if (!provider) throw new BadRequestException('Provider is required');
        
        return await this.authService.handleRegister(provider as string, registerUserAuthDTO)
    }
}