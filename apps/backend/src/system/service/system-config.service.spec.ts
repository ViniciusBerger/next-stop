import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SystemConfigService } from './system-config.service';
import { SystemConfig } from '../schemas/system-config.schema';

/**
 * SystemConfigService Unit Tests
 *
 * To run: npm test -- system/service/system-config.service.spec.ts
 */
describe('SystemConfigService - Unit Test', () => {
  let service: SystemConfigService;
  let configModel: any;

  const mockConfig = {
    _id: 'config_1',
    googleMapsEnabled: true,
    geminiEnabled: true,
    maintenanceMode: false,
    locationHistoryEnabled: true,
    anonymizeData: false,
    set: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    mockConfig.set = jest.fn();
    mockConfig.save = jest.fn().mockResolvedValue(mockConfig);

    configModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemConfigService,
        { provide: getModelToken(SystemConfig.name), useValue: configModel },
      ],
    }).compile();

    service = module.get<SystemConfigService>(SystemConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConfig', () => {
    it('should return existing config', async () => {
      configModel.findOne.mockResolvedValue(mockConfig);

      const result = await service.getConfig();

      expect(result).toEqual(mockConfig);
      expect(configModel.findOne).toHaveBeenCalled();
    });

    it('should create default config if none exists', async () => {
      configModel.findOne.mockResolvedValue(null);
      configModel.create.mockResolvedValue(mockConfig);

      const result = await service.getConfig();

      expect(result).toEqual(mockConfig);
      expect(configModel.create).toHaveBeenCalledWith({});
    });
  });

  describe('updateConfig', () => {
    it('should update an allowed config key', async () => {
      configModel.findOne.mockResolvedValue(mockConfig);

      await service.updateConfig('maintenanceMode', true);

      expect(mockConfig.set).toHaveBeenCalledWith('maintenanceMode', true);
      expect(mockConfig.save).toHaveBeenCalled();
    });

    it('should throw error for unknown config key', async () => {
      await expect(service.updateConfig('invalidKey', true)).rejects.toThrow(
        'Unknown config key: invalidKey',
      );
    });

    it('should create config if none exists then update', async () => {
      const newConfig = { ...mockConfig, set: jest.fn(), save: jest.fn().mockResolvedValue(mockConfig) };
      configModel.findOne.mockResolvedValue(null);
      configModel.create.mockResolvedValue(newConfig);

      await service.updateConfig('geminiEnabled', false);

      expect(configModel.create).toHaveBeenCalledWith({});
      expect(newConfig.set).toHaveBeenCalledWith('geminiEnabled', false);
      expect(newConfig.save).toHaveBeenCalled();
    });

    it('should accept all allowed keys', async () => {
      const allowedKeys = [
        'googleMapsEnabled',
        'geminiEnabled',
        'maintenanceMode',
        'locationHistoryEnabled',
        'anonymizeData',
      ];

      for (const key of allowedKeys) {
        configModel.findOne.mockResolvedValue(mockConfig);
        await expect(service.updateConfig(key, true)).resolves.not.toThrow();
      }
    });
  });
});
