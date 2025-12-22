import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface BiteshipRatesRequest {
  origin_area_id: string;
  destination_area_id: string;
  couriers: string;
  items: Array<{
    name: string;
    description: string;
    value: number;
    length: number;
    width: number;
    height: number;
    weight: number;
    quantity: number;
  }>;
}

export interface BiteshipOrderRequest {
  shipper_contact_name: string;
  shipper_contact_phone: string;
  shipper_contact_email: string;
  shipper_organization: string;
  origin_contact_name: string;
  origin_contact_phone: string;
  origin_address: string;
  origin_note: string;
  origin_postal_code: number;
  origin_area_id: string;
  destination_contact_name: string;
  destination_contact_phone: string;
  destination_contact_email: string;
  destination_address: string;
  destination_postal_code: number;
  destination_note: string;
  destination_area_id: string;
  courier_company: string;
  courier_type: string;
  delivery_type: string;
  delivery_date?: string;
  delivery_time?: string;
  order_note: string;
  items: Array<{
    id: string;
    name: string;
    description: string;
    value: number;
    length: number;
    width: number;
    height: number;
    weight: number;
    quantity: number;
  }>;
}

@Injectable()
export class BiteshipService {
  private readonly axiosInstance: AxiosInstance;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BITESHIP_API_KEY') || '';

    this.axiosInstance = axios.create({
      baseURL: 'https://api.biteship.com/v1',
      headers: {
        Authorization: this.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Cek Ongkir - Get shipping rates
   */
  async cekOngkir(data: BiteshipRatesRequest) {
    try {
      const response = await this.axiosInstance.post('/rates/couriers', data);
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Gagal cek ongkir',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Buat Order Shipment ke Biteship
   */
  async buatOrderShipment(data: BiteshipOrderRequest) {
    try {
      const response = await this.axiosInstance.post('/orders', data);
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Gagal membuat order shipment',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Tracking Shipment
   */
  async trackingShipment(waybillId: string, courier: string) {
    try {
      const response = await this.axiosInstance.get(
        `/trackings/${waybillId}/couriers/${courier}`,
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Gagal tracking shipment',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get Order Detail dari Biteship
   */
  async getOrderDetail(orderId: string) {
    try {
      const response = await this.axiosInstance.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Gagal get order detail',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Search Area/Location
   */
  async cariLokasi(query: string, countries?: string) {
    try {
      const params: any = { input: query };
      if (countries) params.countries = countries;

      const response = await this.axiosInstance.get('/maps/areas', { params });
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Gagal cari lokasi',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Compatibility wrappers used by higher-level code/tests in repo
  async getRates(payload: any) {
    // Adapt payload if necessary; for now assume payload matches BiteshipRatesRequest
    return await this.cekOngkir(payload);
  }

  async createOrder(payload: any) {
    // Adapt payload if necessary; for now assume payload matches BiteshipOrderRequest
    return await this.buatOrderShipment(payload);
  }
}
