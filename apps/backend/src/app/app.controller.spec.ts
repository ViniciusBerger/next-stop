import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { verify } from 'crypto';
import { verifyToken } from '@clerk/backend';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {provide:AuthGuard, 
          useValue: {verifyToken: jest.fn().mockReturnValue(true)} // A "fake" service!
        },
        AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return status 200', () => {
      expect(appController.getHello()).toEqual({message: "Hello world", status: 200});
    });


  });
});
