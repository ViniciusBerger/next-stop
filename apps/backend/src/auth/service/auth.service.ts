import { BadRequestException, Injectable } from "@nestjs/common";
import { AuthStrategy } from "../strategies/auth-strategy";
import { RegisterUserDTO } from "../DTOs/register.user.DTO";
import { ValidateUserDTO } from "../DTOs/validate.user.DTO";
/**
 * AuthService
 * 
 * Central authentication service responsible for handling user registration
 * and validation across multiple auth providers.
 *
 * This service uses the AuthStrategyFactory to dynamically resolve the proper
 * authentication strategy based on the given provider (eg email).
 *
 * - Delegate register requests to the appropriate auth strategy
 * - Delegate validation (login) requests to the appropriate auth strategy
 * - Throw BadRequestException when authentication fails
 *
 * Follows the Strategy + Factory pattern to keep provider-specific logic
 * decoupled from the core service.
 * 
 * @author Vinicius Berger
 */


@Injectable()
export class AuthService {
    constructor(private readonly strategy: AuthStrategy) {}

    async handleRegister(registerUserDTO: RegisterUserDTO) {
        const user = await this.strategy.register(registerUserDTO)
        if (!user) throw new BadRequestException()
        return user;
    }

    async handleValidate( validateUserDTO: ValidateUserDTO) {
        const user = await this.strategy.validate(validateUserDTO)
        if (!user) throw new BadRequestException
        return user;
    }


}