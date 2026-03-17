import { Test, TestingModule } from '@nestjs/testing';
import { BadgeController } from './badge.controller';
import { BadgeService } from '../service/badge.service';
import { BadgeCheckerService } from '../checker/badge-checker.service'; 
import { NotFoundException, ConflictException } from '@nestjs/common';

/**
 * BadgeController Unit Tests
 * 
 * To run: npm test -- apps/backend/src/badges/controller/badge.controller.spec.ts
 */
describe('BadgeController - Unit Test', () => {
  let controller: BadgeController;
  let service: BadgeService;
  let checkerService: BadgeCheckerService;

  const mockBadge = {
    _id: 'badge_123',
    badgeId: 'trendsetter',
    name: 'The Trendsetter',
    description: 'Have 10 people join an event you created',
    category: 'Social & Community',
    iconUrl: '',
    totalAwarded: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: function() { return this; }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BadgeController],
      providers: [
        {
          provide: BadgeService,
          useValue: {
            createBadge: jest.fn(),
            getAllBadges: jest.fn(),
            getBadge: jest.fn(),
            getBadgeById: jest.fn(),
            updateBadge: jest.fn(),
            deleteBadge: jest.fn(),
            getBadgeStats: jest.fn(),
            incrementAwardedCount: jest.fn(),
          },
        },
        {
          provide: BadgeCheckerService,
          useValue: {
            checkAllBadges: jest.fn(),
            awardBadge: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BadgeController>(BadgeController);
    service = module.get<BadgeService>(BadgeService);
    checkerService = module.get<BadgeCheckerService>(BadgeCheckerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(checkerService).toBeDefined();
  });

  describe('createBadge', () => {
    it('should create a new badge', async () => {
      const createDto = {
        badgeId: 'new-badge',
        name: 'New Badge',
        description: 'Description',
        category: 'Category',
        iconUrl: '',
      };

      jest.spyOn(service, 'createBadge').mockResolvedValue(mockBadge as any);

      const result = await controller.createBadge(createDto);

      expect(result).toBeDefined();
      expect(service.createBadge).toHaveBeenCalledWith(createDto);
    });
  });

  describe('getBadges', () => {
    it('should return all badges', async () => {
      jest.spyOn(service, 'getAllBadges').mockResolvedValue([mockBadge] as any);

      const result = await controller.getBadges();

      expect(result).toHaveLength(1);
      expect(service.getAllBadges).toHaveBeenCalled();
    });

    it('should filter badges by category', async () => {
      const dto = { category: 'Social & Community' };
      jest.spyOn(service, 'getAllBadges').mockResolvedValue([mockBadge] as any);

      await controller.getBadges(dto);

      expect(service.getAllBadges).toHaveBeenCalledWith(dto);
    });
  });

  describe('getBadgeStats', () => {
    it('should return badge statistics', async () => {
      const stats = {
        totalBadges: 15,
        totalAwarded: 100,
        byCategory: [
          { category: 'Social & Community', count: 3 },
          { category: 'Exploration & Discovery', count: 4 },
        ],
      };

      jest.spyOn(service, 'getBadgeStats').mockResolvedValue(stats);

      const result = await controller.getBadgeStats();

      expect(result).toEqual(stats);
      expect(service.getBadgeStats).toHaveBeenCalled();
    });
  });

  describe('getBadge', () => {
    it('should return a specific badge', async () => {
      jest.spyOn(service, 'getBadge').mockResolvedValue(mockBadge as any);

      const result = await controller.getBadge('trendsetter');

      expect(result).toBeDefined();
      expect(service.getBadge).toHaveBeenCalledWith('trendsetter');
    });

    it('should throw NotFoundException if badge not found', async () => {
      jest.spyOn(service, 'getBadge').mockRejectedValue(new NotFoundException());

      await expect(controller.getBadge('ghost-badge'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBadge', () => {
    it('should update badge', async () => {
      const updateDto = { iconUrl: 'https://firebase.storage/badge.png' };

      jest.spyOn(service, 'updateBadge').mockResolvedValue({
        ...mockBadge,
        iconUrl: 'https://firebase.storage/badge.png'
      } as any);

      const result = await controller.updateBadge('trendsetter', updateDto);

      expect(result.iconUrl).toBe('https://firebase.storage/badge.png');
      expect(service.updateBadge).toHaveBeenCalledWith('trendsetter', updateDto);
    });
  });

  describe('deleteBadge', () => {
    it('should delete badge', async () => {
      const deleteResult = {
        deleted: true,
        message: 'Badge "The Trendsetter" deleted successfully',
      };

      jest.spyOn(service, 'deleteBadge').mockResolvedValue(deleteResult);

      const result = await controller.deleteBadge('trendsetter');

      expect(result.deleted).toBe(true);
      expect(service.deleteBadge).toHaveBeenCalledWith('trendsetter');
    });
  });

  describe('recalculateBadges', () => {
    it('should recalculate badges for a user', async () => {
      jest.spyOn(checkerService, 'checkAllBadges').mockResolvedValue([]);

      const result = await controller.recalculateBadges('user_123');

      expect(result.success).toBe(true);
      expect(checkerService.checkAllBadges).toHaveBeenCalledWith('user_123');
    });
  });
});