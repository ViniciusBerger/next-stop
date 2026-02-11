import { Injectable, BadRequestException } from '@nestjs/common';
import { EmailStrategy } from './email.strategy';
import { IAuthStrategy } from './auth-strategy.interface';

/**
 * AuthStrategyFactory
 * 
 * Factory responsible for resolving and returning the correct authentication
 * strategy based on the provided auth provider.
 *
 * Implements the Factory + Strategy design patterns to decouple provider-specific
 * authentication logic from the core AuthService.
 *
 * - Receive a provider identifier (e.g., "password")
 * - Return the matching IAuthStrategy implementation
 * - Throw BadRequestException when an unsupported provider is requested
 *
 * This allows new authentication providers to be added easily without modifying
 * existing service logic.
 * 
 * @author Vinicius Berger
 */

@Injectable()
export class AuthStrategyFactory {
  constructor(
    private readonly emailStrategy: EmailStrategy,
  ) {}

  // core logic of the factory
  getStrategy(provider: string): IAuthStrategy {
    
    switch (provider.toLocaleLowerCase()) {
      case 'password':
        return this.emailStrategy;
      default:
        throw new BadRequestException(`Provider ${provider} not supported`);
    }
  }
}