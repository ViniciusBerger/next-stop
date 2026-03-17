import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import mongoose from 'mongoose';
import { ROLES_KEY } from 'src/common/authorization/roles.decorator';

/**
 * RoleGuard
 * 
 * NestJS authorization guard responsible for enforcing Role-Based Access Control (RBAC).
 *
 * This guard uses Reflector to read role metadata applied via decorators on routes
 * and controllers, then validates the authenticated user's roles against the
 * MongoDB User collection.
 *
 * - Read required roles from @Roles decorators
 * - Retrieve the authenticated user from the request context
 * - Fetch the user record from MongoDB
 * - Verify the user has at least one required role
 * - Throw UnauthorizedException when access is denied
 *
 * Designed to integrate with NestJS Guards and custom role decorators
 * for fine-grained route protection.
 * 
 * @author Vinicius Berger
 */

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}  // inject reflector to read metadata (annotations for roles on routes)


    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(), // roles on method
            context.getClass(), // roles on classes
        ])


        // if no roles are required, allow access
        if (!requiredRoles || requiredRoles.length == 0) { return true;}
        const {user} = context.switchToHttp().getRequest().user;


        // fetch database to look for roles
        const mongooseUser = await mongoose.model('User').findById(user.firebaseId).exec();

        if (!mongooseUser) {
            throw new UnauthorizedException('User not found');
        }
        const hasRole = requiredRoles.some((role) => mongooseUser.role?.includes(role));

        
        if (!hasRole) {
          throw new UnauthorizedException('You do not have the necessary permissions');
        }
        return true;


    }
}