import { Controller, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from './entities/shipment.entity';
import { Order } from '../orders/entities/order.entity';
import { ShipmentStatus } from '../../common/enums/shipment-status.enum';
import { OrderStatus } from '../../common/enums/order-status.enum';

@Controller('webhooks/biteship')
export class BiteshipWebhookController {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  @Post()
  async handleWebhook(@Body() payload: any) {
    console.log('Biteship Webhook Received:', payload);

    const { order_id, courier, status } = payload;

    const shipment = await this.shipmentRepository.findOne({
      where: { biteshipOrderId: order_id },
      relations: ['order'],
    });

    if (!shipment) {
      console.log('Shipment not found for order_id:', order_id);
      return { message: 'Shipment not found' };
    }

    switch (status) {
      case 'confirmed':
      case 'allocated':
      case 'picking_up':
        shipment.status = ShipmentStatus.READY_TO_SHIP;
        shipment.updateTrackingInfo(courier?.waybill_id);
        break;

      case 'picked':
      case 'dropping_off':
        shipment.tandaSebagaiDikirim();
        shipment.order.status = OrderStatus.SHIPPED;
        await this.orderRepository.save(shipment.order);
        break;

      case 'delivered':
        shipment.tandaSebagaiDiterima();
        shipment.order.status = OrderStatus.DELIVERED;
        shipment.order.diselesaikanPada = new Date();
        await this.orderRepository.save(shipment.order);
        break;

      case 'canceled':
      case 'rejected':
      case 'returned':
        shipment.status = ShipmentStatus.CANCELLED;
        shipment.order.status = OrderStatus.CANCELLED;
        await this.orderRepository.save(shipment.order);
        break;

      default:
        console.log('Unknown status:', status);
    }

    await this.shipmentRepository.save(shipment);

    return {
      message: 'Webhook processed successfully',
      shipment_id: shipment.id,
      status: shipment.status,
    };
  }
}
