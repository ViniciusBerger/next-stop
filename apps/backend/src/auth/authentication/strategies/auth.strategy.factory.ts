import { Injectable, BadRequestException } from '@nestjs/common';
import { EmailStrategy } from '../strategies/email.strategy';
import { AuthStrategy } from './auth.strategy.abstract';

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
  getStrategy(provider: string): AuthStrategy {
    switch (provider.toLocaleLowerCase()) {
      case 'password':
      case 'email':
        return this.emailStrategy;
      case 'google':
        
      default:
        throw new BadRequestException(`Provider ${provider} not supported`);
    }
  }
}