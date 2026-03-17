import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { GlobalValidationPipe } from '../src/common/validation.pipe';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { FirebaseAuthGuard } from '../src/common/firebase/firebase.auth.guard'; // Path to your guard

describe('UserController (E2E)', () => {

  // to run use npm run test:e2e -- test/user.e2e-spec.ts

  let app: INestApplication;
  const MOCK_FIREBASE_UID = 'user_2p8Z8W5z6Xqdd4dfas4256'

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // TRICK: We replace the real Firebase check with a "Fake" one
      .overrideGuard(FirebaseAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          // We manually inject the user object that Firebase usually provides
          req.user = { uid: MOCK_FIREBASE_UID, email: 'test@example.com' };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    
    //E2E needs the same pipes as the real app
    app.useGlobalPipes(GlobalValidationPipe); 
    app.useLogger(['error', 'warn', 'log']);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // TESTS GO HERE
  it ('/user (POST) -> Should create a new user', ()=> {
    const mockUser = { 
        firebaseUid: MOCK_FIREBASE_UID,
        username: 'mockUser',
        email: 'mtest@example.com',
        role: 'member'};  
    
    return request(app.getHttpServer())
        .post('/users/user')
        .send(mockUser)
        .expect(201)
        .expect((res) => {
          if (res.status == 500){console.log(res.body)}
          expect(res.body.username).toEqual(mockUser.username);
          expect(res.body.firebaseUid).toEqual(mockUser.firebaseUid);
          })  
    })
})