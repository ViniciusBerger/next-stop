import { Injectable, BadRequestException } from '@nestjs/common';
import { EmailStrategy } from './email.strategy';
import { IAuthStrategy } from './auth-strategy.interface';

/**
 * In the strategy pattern we must have a factory to handle which strategy
 * we are actually using. 
 * 
 * Factory receives a provider and redirect to the correct provider strategy.
 */
@Injectable()
export class AuthStrategyFactory {
  constructor(
    private readonly emailStrategy: EmailStrategy,
  ) {}

  // This is the core logic of the factory
  getStrategy(provider: string): IAuthStrategy {
    switch (provider.toLocaleLowerCase()) {
      case 'password':
        return this.emailStrategy;
      default:
        throw new BadRequestException(`Provider ${provider} not supported`);
    }
  }
}