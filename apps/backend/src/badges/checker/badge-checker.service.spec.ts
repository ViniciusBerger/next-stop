import { Test, TestingModule } from '@nestjs/testing';
import { BadgeCheckerService } from './badge-checker.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../user/user.schema';
import { Badge } from '../schemas/badges.schema';
import { Review } from '../../reviews/schema/review.schema';
import { Event } from '../../events/schema/event.schema';

/**
 * BadgeCheckerService Unit Tests
 * 
 * To run: npm test -- apps/backend/src/badges/checker/badge-checker.service.spec.ts
 */
describe('BadgeCheckerService - Unit Test', () => {
  let service: BadgeCheckerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BadgeCheckerService,
        {
          provide: getModelToken(User.name),
          useValue: {},
        },
        {
          provide: getModelToken(Badge.name),
          useValue: {},
        },
        {
          provide: getModelToken(Review.name),
          useValue: {},
        },
        {
          provide: getModelToken(Event.name),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<BadgeCheckerService>(BadgeCheckerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: Add more tests for badge awarding logic
});