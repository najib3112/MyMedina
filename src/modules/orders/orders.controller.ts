import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { OrderStatus } from '../../common/enums/order-status.enum';

/**
 * Orders Controller
 *
 * OOP Concepts:
 * - Encapsulation: HTTP handling logic in controller
 * - Single Responsibility: Handles only HTTP requests/responses
 *
 * Design Patterns:
 * - Controller Pattern: Handles HTTP requests
 * - Dependency Injection: OrdersService injected
 * - Guard Pattern: Authentication and authorization
 */
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * POST /orders - Create Order (Checkout)
   * Customer only
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async buatOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    const userId = req.user.userId;
    const order = await this.ordersService.buatOrder(userId, createOrderDto);

    return {
      message: 'Order berhasil dibuat',
      order,
    };
  }

  /**
   * GET /orders - Get My Orders
   * Customer only
   */
  @Get()
  async ambilOrderSaya(@Request() req) {
    const userId = req.user.userId;
    const orders = await this.ordersService.ambilOrderSaya(userId);

    return {
      message: 'Berhasil mengambil daftar order',
      total: orders.length,
      orders,
    };
  }

  /**
   * GET /orders/:id - Get Order by ID
   * Customer (own orders) or Admin (all orders)
   */
  @Get(':id')
  async ambilOrderById(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    const isAdmin =
      req.user.role === Role.ADMIN || req.user.role === Role.OWNER;
    const order = await this.ordersService.ambilOrderById(id, userId, isAdmin);

    return {
      message: 'Berhasil mengambil detail order',
      order,
    };
  }

  /**
   * GET /admin/orders - Get All Orders (Admin)
   * Admin/Owner only
   */
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async ambilSemuaOrder(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: OrderStatus,
  ) {
    const result = await this.ordersService.ambilSemuaOrder(
      Number(page),
      Number(limit),
      status,
    );

    return {
      message: 'Berhasil mengambil daftar semua order',
      ...result,
    };
  }

  /**
   * PUT /orders/:id/status - Update Order Status
   * Admin/Owner only
   */
  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async updateStatusOrder(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const order = await this.ordersService.updateStatusOrder(
      id,
      updateOrderStatusDto,
    );

    return {
      message: 'Status order berhasil diupdate',
      order,
    };
  }
}
