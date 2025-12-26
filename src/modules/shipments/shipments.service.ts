import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from './entities/shipment.entity';
import { Order } from '../orders/entities/order.entity';
import { BiteshipService } from './biteship.service';
import { ShipmentStatus } from '../../common/enums/shipment-status.enum';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { CheckRatesDto } from './dto/check-rates.dto';
import { CreateBiteshipOrderDto } from './dto/create-biteship-order.dto';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly biteshipService: BiteshipService,
  ) {}

  /**
   * Create Shipment (Manual - Original)
   */
  async buatPengiriman(
    createShipmentDto: CreateShipmentDto,
  ): Promise<Shipment> {
    const { orderId, kurir, layanan, nomorResi, biaya } = createShipmentDto;

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order dengan ID ${orderId} tidak ditemukan`);
    }

    if (
      order.status !== OrderStatus.PAID &&
      order.status !== OrderStatus.IN_PRODUCTION &&
      order.status !== OrderStatus.READY_TO_SHIP
    ) {
      throw new BadRequestException(
        `Order dengan status ${order.status} tidak dapat dikirim`,
      );
    }

    const existingShipment = await this.shipmentRepository.findOne({
      where: { orderId },
    });

    if (existingShipment) {
      throw new BadRequestException('Order ini sudah memiliki pengiriman');
    }

    const shipment = this.shipmentRepository.create({
      orderId,
      kurir,
      layanan,
      nomorResi,
      biaya,
      status: ShipmentStatus.PENDING,
    });

    if (order.status === OrderStatus.PAID) {
      order.status = OrderStatus.READY_TO_SHIP;
      await this.orderRepository.save(order);
    }

    return await this.shipmentRepository.save(shipment);
  }

  /**
   * Buat Shipment & Order ke Biteship (Automated)
   */
  async buatPengirimanDenganBiteship(
    dto: CreateBiteshipOrderDto,
  ): Promise<Shipment> {
    const { orderId, ...biteshipData } = dto;

    // Get order with relations
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'items', 'items.product', 'address'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} tidak ditemukan`);
    }

    // Validate order status
    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestException('Order belum dibayar');
    }

    // Check existing shipment
    const existing = await this.shipmentRepository.findOne({
      where: { orderId },
    });

    if (existing) {
      throw new BadRequestException('Shipment sudah ada untuk order ini');
    }

    // Get store config (sesuaikan dengan data toko Anda)
    const storeConfig = {
      shipper_contact_name: 'MyMedina Store',
      shipper_contact_phone: '081234567890',
      shipper_contact_email: 'store@mymedina.com',
      shipper_organization: 'MyMedina',
      origin_contact_name: 'Warehouse MyMedina',
      origin_contact_phone: '081234567890',
      origin_address: 'Jl. Warehouse No. 123, Jakarta Pusat',
      origin_note: 'Dekat Plaza',
      origin_postal_code: 10110,
    };

    // Prepare Biteship order data
    const biteshipOrderData = {
      ...storeConfig,
      origin_area_id: biteshipData.origin_area_id,
      destination_contact_name: biteshipData.destination_contact_name,
      destination_contact_phone: biteshipData.destination_contact_phone,
      destination_contact_email: biteshipData.destination_contact_email,
      destination_address: biteshipData.destination_address,
      destination_postal_code: biteshipData.destination_postal_code,
      destination_note: biteshipData.destination_note || '',
      destination_area_id: biteshipData.destination_area_id,
      courier_company: biteshipData.courier_company,
      courier_type: biteshipData.courier_type,
      delivery_type: 'now',
      order_note: `Order #${order.nomorOrder}`,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.namaProduct,
        description: item.namaProduct,
        value: Number(item.hargaSatuan),
        length: 10, // cm - sesuaikan dengan data produk
        width: 10,
        height: 10,
        weight: 500, // gram - sesuaikan dengan data produk
        quantity: item.kuantitas,
      })),
    };

    // Create order to Biteship
    const biteshipOrder =
      await this.biteshipService.buatOrderShipment(biteshipOrderData);

    // Create shipment in database
    const shipment = this.shipmentRepository.create({
      orderId,
      biteshipOrderId: biteshipOrder.id,
      biteshipTrackingId: biteshipOrder.courier?.tracking_id,
      courierTrackingUrl: biteshipOrder.courier?.link,
      courierWaybillId: biteshipOrder.courier?.waybill_id,
      kurir: biteshipOrder.courier?.company,
      layanan: biteshipOrder.courier?.type,
      nomorResi: biteshipOrder.courier?.waybill_id,
      biaya: biteshipOrder.price,
      estimasiPengiriman: biteshipOrder.courier?.delivery_time
        ? new Date(biteshipOrder.courier.delivery_time)
        : undefined,
      deskripsi: `Pengiriman via ${biteshipOrder.courier?.company} - ${biteshipOrder.courier?.type}`,
      status: ShipmentStatus.PENDING,
    } as any);

    // Update order status
    order.status = OrderStatus.READY_TO_SHIP;
    await this.orderRepository.save(order);

    return await this.shipmentRepository.save(shipment as any);
  }

  /**
   * Get Shipment by Order ID
   */
  async ambilPengirimanByOrderId(orderId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { orderId },
      relations: ['order'],
    });

    if (!shipment) {
      throw new NotFoundException(
        `Pengiriman untuk order ${orderId} tidak ditemukan`,
      );
    }

    return shipment;
  }

  /**
   * Get Shipment by ID
   */
  async ambilPengirimanById(shipmentId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
      relations: ['order'],
    });

    if (!shipment) {
      throw new NotFoundException(
        `Pengiriman dengan ID ${shipmentId} tidak ditemukan`,
      );
    }

    return shipment;
  }

  /**
   * Update Shipment Status
   */
  async updateStatusPengiriman(
    shipmentId: string,
    updateShipmentStatusDto: UpdateShipmentStatusDto,
  ): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
      relations: ['order'],
    });

    if (!shipment) {
      throw new NotFoundException(
        `Pengiriman dengan ID ${shipmentId} tidak ditemukan`,
      );
    }

    const { status, nomorResi } = updateShipmentStatusDto;

    // Update using entity methods
    if (nomorResi) {
      shipment.updateTrackingInfo(nomorResi);
    }

    shipment.status = status;

    if (status === ShipmentStatus.SHIPPED) {
      shipment.tandaSebagaiDikirim();
      const order = shipment.order;
      order.status = OrderStatus.SHIPPED;
      await this.orderRepository.save(order);
    } else if (status === ShipmentStatus.DELIVERED) {
      shipment.tandaSebagaiDiterima();
      const order = shipment.order;
      order.status = OrderStatus.COMPLETED;
      order.diselesaikanPada = new Date();
      await this.orderRepository.save(order);
    }

    return await this.shipmentRepository.save(shipment);
  }

  /**
   * Tracking dari Biteship
   */
  async trackingDariBiteship(shipmentId: string) {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment tidak ditemukan');
    }

    if (!shipment.courierWaybillId || !shipment.kurir) {
      throw new BadRequestException('Data tracking tidak lengkap');
    }

    return await this.biteshipService.trackingShipment(
      shipment.courierWaybillId,
      shipment.kurir,
    );
  }

  /**
   * Cari Lokasi
   */
  async cariLokasi(query: string) {
    return await this.biteshipService.cariLokasi(query, 'ID');
  }

  /**
   * Helper: Create shipment in Biteship from an Order (used by payment webhook flow)
   */
  async createShipment(order: Order) {
    const shipper = {
      name: 'MyMedina Store',
      email: 'store@mymedina.com',
      phone: '081234567890',
      address: 'Jl. Warehouse No. 123, Jakarta Pusat',
      country: 'ID',
      province: 'DKI Jakarta',
      city: 'Jakarta Pusat',
      postal_code: '12345',
    };

    const receiver = {
      name: order.namaPenerima,
      email: order.user?.email,
      phone: order.teleponPenerima,
      address: `${order.alamatBaris1} ${order.alamatBaris2 || ''}`,
      country: 'ID',
      province: order.provinsi,
      city: order.kota,
      postal_code: order.kodePos,
    };

    const items = (order.items || []).map(item => ({
      name: item.namaProduct,
      description: item.namaProduct,
      quantity: item.kuantitas,
      weight: 500,
      value: Number(item.hargaSatuan),
    }));

    const orderRequest = {
      reference: order.nomorOrder,
      shipper,
      receiver,
      items,
      courier_code: (order as any).selectedCourierCode || (order as any).shipmentCourierCode || 'jne',
      courier_service_code: (order as any).selectedServiceCode || '',
      notes: order.catatan || '',
    };

    return await this.biteshipService.createOrder(orderRequest);
  }

  /**
   * Update tracking info
   * Menggunakan method entity: updateTrackingInfo()
   *
   * @param shipmentId - ID shipment
   * @param nomorResi - Nomor resi baru
   */
  async updateTrackingInfoShipment(
    shipmentId: string,
    nomorResi: string,
  ): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment tidak ditemukan');
    }

    // Gunakan method entity
    shipment.updateTrackingInfo(nomorResi);

    return await this.shipmentRepository.save(shipment);
  }

  /**
   * Update status shipment
   * Menggunakan method entity: updateStatus()
   *
   * @param shipmentId - ID shipment
   * @param statusBaru - Status baru
   */
  async updateStatusShipment(
    shipmentId: string,
    statusBaru: ShipmentStatus,
  ): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment tidak ditemukan');
    }

    // Gunakan method entity
    shipment.updateStatus(statusBaru);

    return await this.shipmentRepository.save(shipment);
  }

  /**
   * Tandai shipment sebagai dikirim
   * Menggunakan method entity: tandaSebagaiDikirim()
   *
   * @param shipmentId - ID shipment
   */
  async tandaSebagaiDikirimShipment(shipmentId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
      relations: ['order'],
    });

    if (!shipment) {
      throw new NotFoundException('Shipment tidak ditemukan');
    }

    // Gunakan method entity
    shipment.tandaSebagaiDikirim();

    // Update order status
    const order = shipment.order;
    order.status = OrderStatus.SHIPPED;
    order.dikirimPada = new Date();
    await this.orderRepository.save(order);

    return await this.shipmentRepository.save(shipment);
  }

  /**
   * Tandai shipment sebagai diterima
   * Menggunakan method entity: tandaSebagaiDiterima()
   *
   * @param shipmentId - ID shipment
   */
  async tandaSebagaiDiterimaShipment(shipmentId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
      relations: ['order'],
    });

    if (!shipment) {
      throw new NotFoundException('Shipment tidak ditemukan');
    }

    // Gunakan method entity
    shipment.tandaSebagaiDiterima();

    // Update order status
    const order = shipment.order;
    order.status = OrderStatus.DELIVERED;
    order.diselesaikanPada = new Date();
    await this.orderRepository.save(order);

    return await this.shipmentRepository.save(shipment);
  }
}
