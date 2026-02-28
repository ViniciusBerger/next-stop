import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRepository } from '../../user/user.repository';

@Injectable()
export class AccountStatusGuard implements CanActivate {
  constructor(private readonly userRepository: UserRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    // Your AuthGuard should set req.user
    const firebaseUid: string | undefined = req.user?.firebaseUid;

    // If request is not authenticated, do nothing here
    if (!firebaseUid) return true;

    const user = await this.userRepository.findOne({ firebaseUid });
    if (!user) return true;

    // Support both old isBanned flag and new status field
    if (user.isBanned === true || user.status === 'BANNED') {
      throw new ForbiddenException('Account banned');
    }

    if (user.status === 'SUSPENDED') {
      if (user.suspendedUntil && user.suspendedUntil > new Date()) {
        throw new ForbiddenException(
          `Account suspended until ${user.suspendedUntil.toISOString()}`,
        );
      }
      throw new ForbiddenException('Account suspended');
    }

    // ACTIVE
    return true;
  }
}
