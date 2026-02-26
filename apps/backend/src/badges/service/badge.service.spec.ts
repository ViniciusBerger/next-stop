import { Test, TestingModule } from '@nestjs/testing';
import { BadgeService } from './badge.service';
import { BadgeRepository } from '../repository/badge.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';

/**
 * BadgeService Unit Tests
 * 
 * To run: npm test -- apps/backend/src/badges/service/badge.service.spec.ts
 */
describe('BadgeService - Unit Test', () => {
  let service: BadgeService;
  let repository: BadgeRepository;

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
      providers: [
        BadgeService,
        {
          provide: BadgeRepository,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findMany: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findByBadgeId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            incrementTotalAwarded: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BadgeService>(BadgeService);
    repository = module.get<BadgeRepository>(BadgeRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('createBadge', () => {
    it('should create a new badge', async () => {
      const createDto = {
        badgeId: 'new-badge',
        name: 'New Badge',
        description: 'A new badge',
        category: 'Test Category',
        iconUrl: '',
      };

      jest.spyOn(repository, 'findByBadgeId').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockResolvedValue(mockBadge as any);

      const result = await service.createBadge(createDto);

      expect(result).toEqual(mockBadge);
      expect(repository.findByBadgeId).toHaveBeenCalledWith('new-badge');
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw ConflictException if badgeId already exists', async () => {
      const createDto = {
        badgeId: 'existing-badge',
        name: 'Badge',
        description: 'Desc',
        category: 'Category',
        iconUrl: '',
      };

      jest.spyOn(repository, 'findByBadgeId').mockResolvedValue(mockBadge as any);

      await expect(service.createBadge(createDto))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('getAllBadges', () => {
    it('should return all badges when no filter provided', async () => {
      jest.spyOn(repository, 'findAll').mockResolvedValue([mockBadge] as any);

      const result = await service.getAllBadges();

      expect(result).toHaveLength(1);
      expect(repository.findAll).toHaveBeenCalled();
    });

    it('should filter by category', async () => {
      const dto = { category: 'Social & Community' };
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockBadge] as any);

      await service.getAllBadges(dto);

      expect(repository.findMany).toHaveBeenCalledWith({ category: 'Social & Community' });
    });

    it('should filter by badgeId', async () => {
      const dto = { badgeId: 'trendsetter' };
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockBadge] as any);

      await service.getAllBadges(dto);

      expect(repository.findMany).toHaveBeenCalledWith({ badgeId: 'trendsetter' });
    });

    it('should filter by tier', async () => {
      const dto = { tier: 'Bronze' };
      jest.spyOn(repository, 'findMany').mockResolvedValue([mockBadge] as any);

      await service.getAllBadges(dto);

      expect(repository.findMany).toHaveBeenCalledWith({ tier: 'Bronze' });
    });
  });

  describe('getBadge', () => {
    it('should return badge by badgeId', async () => {
      jest.spyOn(repository, 'findByBadgeId').mockResolvedValue(mockBadge as any);

      const result = await service.getBadge('trendsetter');

      expect(result).toEqual(mockBadge);
      expect(repository.findByBadgeId).toHaveBeenCalledWith('trendsetter');
    });

    it('should throw NotFoundException if badge not found', async () => {
      jest.spyOn(repository, 'findByBadgeId').mockResolvedValue(null);

      await expect(service.getBadge('ghost-badge'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getBadgeById', () => {
    it('should return badge by MongoDB _id', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockBadge as any);

      const result = await service.getBadgeById('badge_123');

      expect(result).toEqual(mockBadge);
      expect(repository.findById).toHaveBeenCalledWith('badge_123');
    });

    it('should throw NotFoundException if badge not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.getBadgeById('ghost_id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBadge', () => {
    it('should update badge iconUrl', async () => {
      const updateDto = { iconUrl: 'https://firebase.storage/badge.png' };

      jest.spyOn(repository, 'update').mockResolvedValue({
        ...mockBadge,
        iconUrl: 'https://firebase.storage/badge.png'
      } as any);

      const result = await service.updateBadge('trendsetter', updateDto);

      expect(result.iconUrl).toBe('https://firebase.storage/badge.png');
    });

    it('should update multiple fields', async () => {
      const updateDto = {
        name: 'Updated Name',
        description: 'Updated description',
        iconUrl: 'https://firebase.storage/new.png'
      };

      jest.spyOn(repository, 'update').mockResolvedValue(mockBadge as any);

      await service.updateBadge('trendsetter', updateDto);

      expect(repository.update).toHaveBeenCalledWith(
        { badgeId: 'trendsetter' },
        expect.objectContaining({
          $set: expect.objectContaining({
            name: 'Updated Name',
            description: 'Updated description',
            iconUrl: 'https://firebase.storage/new.png'
          })
        })
      );
    });

    it('should throw NotFoundException if badge not found', async () => {
      const updateDto = { name: 'New Name' };

      jest.spyOn(repository, 'update').mockResolvedValue(null);

      await expect(service.updateBadge('ghost-badge', updateDto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteBadge', () => {
    it('should delete badge and return message', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(mockBadge as any);

      const result = await service.deleteBadge('trendsetter');

      expect(result.deleted).toBe(true);
      expect(result.message).toContain('The Trendsetter');
      expect(repository.delete).toHaveBeenCalledWith({ badgeId: 'trendsetter' });
    });

    it('should throw NotFoundException if badge not found', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(null);

      await expect(service.deleteBadge('ghost-badge'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getBadgeStats', () => {
    it('should return badge statistics', async () => {
      const badges = [
        { ...mockBadge, totalAwarded: 10 },
        { ...mockBadge, badgeId: 'badge2', category: 'Exploration & Discovery', totalAwarded: 5 },
        { ...mockBadge, badgeId: 'badge3', category: 'Social & Community', totalAwarded: 3 },
      ];

      jest.spyOn(repository, 'findAll').mockResolvedValue(badges as any);

      const result = await service.getBadgeStats();

      expect(result.totalBadges).toBe(3);
      expect(result.totalAwarded).toBe(18);
      expect(result.byCategory).toHaveLength(2);
    });
  });

  describe('incrementAwardedCount', () => {
    it('should increment totalAwarded counter', async () => {
      jest.spyOn(repository, 'incrementTotalAwarded').mockResolvedValue();

      await service.incrementAwardedCount('trendsetter');

      expect(repository.incrementTotalAwarded).toHaveBeenCalledWith('trendsetter');
    });
  });
});