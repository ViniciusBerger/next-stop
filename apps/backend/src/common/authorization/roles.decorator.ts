import { SetMetadata } from '@nestjs/common';
/**
 * Roles decorator to specify required roles for route handlers.
 * @author Vinicius Berger
 * 
 * @description
 * This decorator allows you to define roles required to access specific route handlers
 * in a NestJS application. It uses NestJS's SetMetadata function to attach metadata
 * to the route handler, which can later be accessed by guards or interceptors to enforce
 * 
 * @param roles - Array of roles required to access the route.
 */

export const ROLES_KEY = 'roles';

// This creates a "label" we can stick on our functions
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);