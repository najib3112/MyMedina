// src/shipment/shipments.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentController } from './shipments.controller';
import { BiteshipService } from './biteship.service';
import { ShipmentsService } from './shipments.service';
import { CheckRatesDto } from './dto/check-rates.dto';

describe('ShipmentController', () => {
  let controller: ShipmentController;
  let biteshipService: BiteshipService;

  const mockBiteshipService = {
    cariLokasi: jest.fn(),
    cekOngkir: jest.fn(),
    buatOrderShipment: jest.fn(),
    trackingShipment: jest.fn(),
  };

  const mockShipmentsService = {
    buatPengirimanDenganBiteship: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShipmentController],
      providers: [
        { provide: BiteshipService, useValue: mockBiteshipService },
        { provide: ShipmentsService, useValue: mockShipmentsService },
      ],
    }).compile();

    controller = module.get<ShipmentController>(ShipmentController);
    biteshipService = module.get<BiteshipService>(BiteshipService);
  });

  describe('getAreas', () => {
    it('should return areas from Biteship', async () => {
      const mockResult = { areas: [{ id: 'IDNP1', name: 'Pekanbaru' }] };
      mockBiteshipService.cariLokasi.mockResolvedValue(mockResult);

      const result = await controller.getAreas('pekanbaru');

      expect(mockBiteshipService.cariLokasi).toHaveBeenCalledWith('pekanbaru', 'ID');
      expect(result).toEqual(mockResult);
    });
  });

  describe('getRates', () => {
    it('should return shipping rates successfully', async () => {
      const mockRates = {
        success: true,
        pricing: [
          { courier_company: 'JNE', courier_service_name: 'REG', price: 15000 },
          { courier_company: 'J&T', courier_service_name: 'EZ', price: 14000 },
        ],
      };

      mockBiteshipService.cekOngkir.mockResolvedValue(mockRates);

      const dto: CheckRatesDto = {
        origin_area_id: 'IDNP123',
        destination_area_id: 'IDNP456',
        couriers: 'jne,jnt',
        items: [
          {
            name: 'Baju',
            value: 100000,
            quantity: 1,
            weight: 500,
            length: 20,
            width: 15,
            height: 10,
          },
        ],
      };

      const result = await controller.getRates(dto);

      expect(mockBiteshipService.cekOngkir).toHaveBeenCalledWith({
        origin_area_id: 'IDNP123',
        destination_area_id: 'IDNP456',
        couriers: 'jne,jnt',
        items: expect.arrayContaining([
          expect.objectContaining({
            name: 'Baju',
            value: 100000,
            quantity: 1,
            weight: 500,
          }),
        ]),
      });

      expect(result).toEqual(mockRates);
    });

    it('should throw BadRequestException when required fields missing', async () => {
      const invalidDto = {
        origin_area_id: '',
        destination_area_id: 'IDNP456',
        items: [],
      } as CheckRatesDto;

      await expect(controller.getRates(invalidDto)).rejects.toThrow('origin_area_id wajib diisi');
    });
  });

  describe('createOrder', () => {
    it('should call buatPengirimanDenganBiteship when orderId exists', async () => {
      const mockResult = { id: 'shipment123' };
      mockShipmentsService.buatPengirimanDenganBiteship.mockResolvedValue(mockResult);

      const body = { orderId: '123', destination_area_id: 'IDNP456' };

      const result = await controller.createOrder(body);

      expect(mockShipmentsService.buatPengirimanDenganBiteship).toHaveBeenCalledWith(body);
      expect(result).toEqual(mockResult);
    });

    it('should call buatOrderShipment directly when no orderId', async () => {
      const mockResult = { id: 'biteship123' };
      mockBiteshipService.buatOrderShipment.mockResolvedValue(mockResult);

      const body = { destination_area_id: 'IDNP456' };

      const result = await controller.createOrder(body);

      expect(mockBiteshipService.buatOrderShipment).toHaveBeenCalledWith(body);
      expect(result).toEqual(mockResult);
    });
  });
});