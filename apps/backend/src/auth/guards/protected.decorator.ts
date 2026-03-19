import { applyDecorators, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../../common/firebase/firebase.auth.guard';
import { AccountStatusGuard } from './account-status.guard';

export function Protected() {
  return applyDecorators(
    UseGuards(FirebaseAuthGuard, AccountStatusGuard)
  );
}