import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import admin  from 'firebase-admin'

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  
  // canActivate method to verify if user can proceed
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization

    // no token found
    if (!auth || !auth.startsWith('Bearer')) {
        throw new UnauthorizedException();
    }

    try {
        const idToken = auth.split(' ')[1]
        const payload = await admin.auth().verifyIdToken(idToken)

        request.user = { uid: payload.uid };
        return true;
    } catch (error) {
        // invalid token
        console.error('--- Auth Error ---');
        console.error('Message:', error.message);
        console.error('Reason:', error.code); // specific error reasons
        console.error('------------------------');
        throw new UnauthorizedException()
    }
  }
   
}