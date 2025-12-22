import { Test, TestingModule } from '@nestjs/testing';
import { BiteshipService } from './biteship.service';
import { ShipmentsService } from './shipments.service';
import { ShipmentController } from './shipments.controller';

describe('ShipmentController', () => {
  let controller: ShipmentController;
  let service: BiteshipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShipmentController],
      providers: [
        {
          provide: BiteshipService,
          useValue: {
            getAreas: jest.fn(),
            getCouriers: jest.fn(),
            getRates: jest.fn(),
            createOrder: jest.fn(),
            trackShipment: jest.fn(),
          },
        },
        {
          provide: ShipmentsService,
          useValue: {
            buatPengirimanDenganBiteship: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ShipmentController>(ShipmentController);
    service = module.get<BiteshipService>(BiteshipService);
  });

  describe('getRates', () => {
    it('should return rates for given origin and destination', async () => {
      const mockRates = {
        success: true,
        data: [
          {
            courier_code: 'jne',
            courier_service_code: 'jne:reg',
            price: 15000,
          },
        ],
      };

      jest.spyOn(service, 'getRates').mockResolvedValue(mockRates as any);

      const result = await controller.getRates({
        origin: {
          country: 'ID',
          admin_level_1: 'DKI Jakarta',
          admin_level_2: 'Jakarta Pusat',
        },
        destination: {
          country: 'ID',
          admin_level_1: 'Jawa Timur',
          admin_level_2: 'Surabaya',
        },
        items: [{ name: 'Test', quantity: 1, weight: 500 }],
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRates);
    });
  });
});