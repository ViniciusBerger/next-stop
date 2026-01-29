import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import mongoose from 'mongoose';
import { ROLES_KEY } from 'src/roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {
        // inject reflector to read metadata (annotations for roles on routes)
    }


    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(), // roles on method
            context.getClass(), // roles on classes
        ])


        // if no roles are required, allow access
        if (!requiredRoles || requiredRoles.length == 0) { return true;}
        const {user} = context.switchToHttp().getRequest().user;


        // fetch database to look for roles
        const mongooseUser = await mongoose.model('User').findById(user.uid)
        const hasRole = requiredRoles.some((role) => mongooseUser.role?.includes(role));

        
        if (!hasRole) {
          throw new UnauthorizedException('You do not have the necessary permissions');
        }
        return true;


    }
}