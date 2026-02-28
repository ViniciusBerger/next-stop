import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AccountStatusGuard } from './account-status.guard';

export function Protected() {
  return applyDecorators(UseGuards(AuthGuard, AccountStatusGuard));
}
