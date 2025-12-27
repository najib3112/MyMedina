// src/shipment/shipment.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  BadRequestException,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { BiteshipService } from './biteship.service';
import { CheckRatesDto } from './dto/check-rates.dto';

@Controller('shipment')
export class ShipmentController {
  private readonly logger = new Logger(ShipmentController.name);

  constructor(
    private readonly shipmentsService: ShipmentsService,
    private readonly biteshipService: BiteshipService,
  ) {}

  @Get('areas')
  @HttpCode(HttpStatus.OK)
  async getAreas(@Query('input') input: string) {
    const result = await this.biteshipService.cariLokasi(input || '', 'ID');
    return result; // Selalu return { areas: [...] } bahkan kalau kosong
  }

  @Post('rates')
  @HttpCode(HttpStatus.OK)
  async getRates(@Body() body: CheckRatesDto) {
    try {
      this.logger.log('Calculating shipping rates');
      this.logger.debug('Payload:', JSON.stringify(body, null, 2));

      // Validasi
      if (!body.origin_area_id || !body.destination_area_id) {
        throw new BadRequestException('origin_area_id dan destination_area_id wajib diisi');
      }

      if (!body.items || body.items.length === 0) {
        throw new BadRequestException('Items tidak boleh kosong');
      }

      // Call Biteship
      const result = await this.biteshipService.cekOngkir({
        origin_area_id: body.origin_area_id,
        destination_area_id: body.destination_area_id,
        couriers: 'jne,sicepat,pos', // Gunakan semua kurir yang didukung
        items: body.items.map(item => ({
          name: item.name,
          description: item.description || item.name,
          value: item.value,
          length: item.length,
          width: item.width,
          height: item.height,
          weight: item.weight,
          quantity: item.quantity,
        })),
      });

      this.logger.log('✅ Biteship response SUCCESS');
      return result;

    } catch (error) {
      // ========== PERBAIKAN ERROR LOGGING ==========
      this.logger.error('❌ Biteship API Error:');
      this.logger.error('Status:', error.response?.status);
      this.logger.error('Status Text:', error.response?.statusText);
      this.logger.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
      this.logger.error('Error Message:', error.message);
      
      // Jika error dari Biteship, kirim detail lengkap ke frontend
      if (error.response?.data) {
        throw new BadRequestException({
          message: error.response.data.message || 'Gagal menghitung ongkir',
          error: error.response.data.error,
          code: error.response.data.code,
          details: error.response.data,
          hint: 'Cek API Key Biteship di backend .env file'
        });
      }
      
      // Jika error internal (bukan dari Biteship)
      throw new BadRequestException({
        message: 'Terjadi kesalahan saat menghitung ongkir',
        error: error.message,
        hint: 'Cek koneksi ke Biteship API atau API Key'
      });
    }
  }

  @Post('order')
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() body: any) {
    try {
      if (body?.orderId) {
        return await this.shipmentsService.buatPengirimanDenganBiteship(body);
      }
      return await this.biteshipService.buatOrderShipment(body);
    } catch (error) {
      throw new BadRequestException({
        message: error.response?.data?.message || 'Gagal membuat shipment',
        details: error.response?.data,
      });
    }
  }

  @Get('tracking/:waybill/:courier')
  @HttpCode(HttpStatus.OK)
  async tracking(@Param('waybill') waybill: string, @Param('courier') courier: string) {
    if (!waybill || !courier) {
      throw new BadRequestException('Waybill dan courier wajib diisi');
    }

    try {
      return await this.biteshipService.trackingShipment(waybill, courier);
    } catch (error) {
      throw new BadRequestException({
        message: error.response?.data?.message || 'Gagal tracking',
        details: error.response?.data,
      });
    }
  }
}