import { Test, TestingModule } from '@nestjs/testing';
import { SystemConfigController } from './system-config.controller';
import { SystemConfigService } from '../service/system-config.service';

/**
 * SystemConfigController Unit Tests
 *
 * To run: npm test -- system/controller/system-config.controller.spec.ts
 */
describe('SystemConfigController - Unit Test', () => {
  let controller: SystemConfigController;
  let service: SystemConfigService;

  const mockConfig = {
    _id: 'config_1',
    googleMapsEnabled: true,
    geminiEnabled: true,
    maintenanceMode: false,
    locationHistoryEnabled: true,
    anonymizeData: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemConfigController],
      providers: [
        {
          provide: SystemConfigService,
          useValue: {
            getConfig: jest.fn(),
            updateConfig: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SystemConfigController>(SystemConfigController);
    service = module.get<SystemConfigService>(SystemConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('getConfig', () => {
    it('should return system configuration', async () => {
      jest.spyOn(service, 'getConfig').mockResolvedValue(mockConfig as any);

      const result = await controller.getConfig();

      expect(result).toEqual(mockConfig);
      expect(service.getConfig).toHaveBeenCalled();
    });
  });

  describe('updateConfig', () => {
    it('should update a config key', async () => {
      const updated = { ...mockConfig, maintenanceMode: true };
      jest.spyOn(service, 'updateConfig').mockResolvedValue(updated as any);

      const result = await controller.updateConfig({ key: 'maintenanceMode', value: true });

      expect(result.maintenanceMode).toBe(true);
      expect(service.updateConfig).toHaveBeenCalledWith('maintenanceMode', true);
    });

    it('should toggle a boolean config value', async () => {
      const updated = { ...mockConfig, googleMapsEnabled: false };
      jest.spyOn(service, 'updateConfig').mockResolvedValue(updated as any);

      const result = await controller.updateConfig({ key: 'googleMapsEnabled', value: false });

      expect(result.googleMapsEnabled).toBe(false);
    });
  });
});
