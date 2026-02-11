import { BadRequestException, Injectable } from "@nestjs/common";
import { AuthStrategyFactory } from "../strategies/auth-strategy.factory";
import { RegisterUserDTO } from "../DTOs/register.user.DTO";
import { ValidateUserDTO } from "../DTOs/validate.user.DTO";

@Injectable()
export class AuthService {
    constructor(private readonly factory: AuthStrategyFactory) {}

    async handleRegister(provider: string, registerUserDTO: RegisterUserDTO) {
        const strategy = this.factory.getStrategy(provider)
        const user = await strategy.register(registerUserDTO)

        if (!user) throw new BadRequestException

        return user;
    }

    async handleValidate(provider: string, validateUserDTO: ValidateUserDTO) {
        const strategy = this.factory.getStrategy(provider)
        const user = await strategy.validate(validateUserDTO)

        if (!user) throw new BadRequestException

        return user;
    }


}