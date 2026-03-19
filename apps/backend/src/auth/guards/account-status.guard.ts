import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AccountStatusGuard implements CanActivate {

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) return true;

    // Support both old and new fields safely
    if ((user as any).status === 'SUSPENDED') {

      if ((user as any).suspendedUntil && (user as any).suspendedUntil > new Date()) {

        throw new ForbiddenException(
          `Account suspended until ${(user as any).suspendedUntil.toISOString()}`
        );

      }

      throw new ForbiddenException('Account suspended');

    }

    return true;

  }

}