import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClerkGuard implements CanActivate {
    private ClerkClient
    
    // inject ConfigService to access environment variables
    constructor(private configService: ConfigService){
        const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
        this.ClerkClient = createClerkClient({ secretKey });
  }

  
  // canActivate method to verify if user can proceed
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization

    // no token found
    if (!auth || !auth.startsWith('Bearer')) {
        throw new UnauthorizedException();
    }

    try {
        const token = auth.split(' ')[1]
        const payload = await verifyToken(token, {
            secretKey: this.configService.get('CLERK_SECRET_KEY'),
        });
        return true;
    } catch (error) {
        // invalid token
        console.error('--- Clerk Auth Error ---');
        console.error('Message:', error.message);
        console.error('Reason:', error.reason); // Clerk specific error reasons
        console.error('------------------------');
        throw new UnauthorizedException()
    }
  }
   
}