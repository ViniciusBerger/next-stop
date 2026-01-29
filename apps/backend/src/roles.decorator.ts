import { SetMetadata } from '@nestjs/common';

// This creates a "label" we can stick on our functions
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);