import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AddressService } from '../services/address.service';
import {
  CreateAddressDto,
  UpdateAddressDto,
  AddressDto,
  SetDefaultAddressDto,
} from '../dto/address.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '../entities/user.entity';

/**
 * Address Controller
 *
 * Endpoints untuk manage user addresses:
 * - GET    /auth/addresses          - Get all addresses
 * - GET    /auth/addresses/:id      - Get single address
 * - GET    /auth/addresses/default  - Get default address
 * - POST   /auth/addresses          - Create new address
 * - PUT    /auth/addresses/:id      - Update address
 * - PUT    /auth/addresses/:id/set-default - Set as default
 * - DELETE /auth/addresses/:id      - Delete address
 *
 * Authentication: Semua endpoints require JWT token
 */
@Controller('auth/addresses')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  /**
   * POST /auth/addresses
   * Create new address
   *
   * @param user - Current user (from token)
   * @param dto - CreateAddressDto
   * @returns Newly created address
   *
   * @example
   * POST /auth/addresses
   * Authorization: Bearer JWT_TOKEN
   *
   * {
   *   "label": "Rumah",
   *   "namaPenerima": "John Doe",
   *   "teleponPenerima": "081234567890",
   *   "alamatBaris1": "Jl. Merdeka No. 123",
   *   "kota": "Jakarta",
   *   "provinsi": "DKI Jakarta",
   *   "kodePos": "12345",
   *   "isDefault": false
   * }
   *
   * Response: 201 Created
   * {
   *   "message": "Alamat berhasil ditambahkan",
   *   "data": {
   *     "id": "uuid",
   *     "label": "Rumah",
   *     "namaPenerima": "John Doe",
   *     ...
   *   }
   * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAddress(
    @CurrentUser() user: User,
    @Body() dto: CreateAddressDto,
  ) {
    const address = await this.addressService.createAddress(user.id, dto);
    return {
      message: 'Alamat berhasil ditambahkan',
      data: address,
    };
  }

  /**
   * GET /auth/addresses
   * Get all active addresses
   *
   * @param user - Current user (from token)
   * @returns List of addresses
   *
   * @example
   * GET /auth/addresses
   * Authorization: Bearer JWT_TOKEN
   *
   * Response: 200 OK
   * {
   *   "message": "Daftar alamat berhasil diambil",
   *   "data": [
   *     {
   *       "id": "uuid",
   *       "label": "Rumah",
   *       "isDefault": true,
   *       ...
   *     }
   *   ]
   * }
   */
  @Get()
  async getAddresses(@CurrentUser() user: User) {
    const addresses = await this.addressService.getAddresses(user.id);
    return {
      message: 'Daftar alamat berhasil diambil',
      data: addresses,
    };
  }

  /**
   * GET /auth/addresses/default
   * Get default address
   * Jika tidak ada default, return address terbaru
   *
   * @param user - Current user (from token)
   * @returns Default address atau null
   *
   * @example
   * GET /auth/addresses/default
   * Authorization: Bearer JWT_TOKEN
   *
   * Response: 200 OK
   * {
   *   "message": "Alamat default berhasil diambil",
   *   "data": {
   *     "id": "uuid",
   *     "label": "Rumah",
   *     ...
   *   }
   * }
   */
  @Get('default')
  async getDefaultAddress(@CurrentUser() user: User) {
    const address = await this.addressService.getDefaultAddress(user.id);
    return {
      message: address
        ? 'Alamat default berhasil diambil'
        : 'Alamat tidak ditemukan',
      data: address,
    };
  }

  /**
   * GET /auth/addresses/:id
   * Get single address
   *
   * @param user - Current user (from token)
   * @param addressId - Address ID
   * @returns Address details
   *
   * @example
   * GET /auth/addresses/uuid
   * Authorization: Bearer JWT_TOKEN
   *
   * Response: 200 OK
   * {
   *   "message": "Alamat berhasil diambil",
   *   "data": { ... }
   * }
   */
  @Get(':id')
  async getAddress(@CurrentUser() user: User, @Param('id') addressId: string) {
    const address = await this.addressService.getAddress(addressId, user.id);
    return {
      message: 'Alamat berhasil diambil',
      data: address,
    };
  }

  /**
   * PUT /auth/addresses/:id
   * Update address
   *
   * @param user - Current user (from token)
   * @param addressId - Address ID
   * @param dto - UpdateAddressDto
   * @returns Updated address
   *
   * @example
   * PUT /auth/addresses/uuid
   * Authorization: Bearer JWT_TOKEN
   *
   * {
   *   "label": "Rumah Baru",
   *   "kota": "Bandung"
   * }
   *
   * Response: 200 OK
   * {
   *   "message": "Alamat berhasil diperbarui",
   *   "data": { ... }
   * }
   */
  @Put(':id')
  async updateAddress(
    @CurrentUser() user: User,
    @Param('id') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    const address = await this.addressService.updateAddress(
      addressId,
      user.id,
      dto,
    );
    return {
      message: 'Alamat berhasil diperbarui',
      data: address,
    };
  }

  /**
   * PUT /auth/addresses/:id/set-default
   * Set address as default
   *
   * @param user - Current user (from token)
   * @param addressId - Address ID
   * @returns Updated address
   *
   * @example
   * PUT /auth/addresses/uuid/set-default
   * Authorization: Bearer JWT_TOKEN
   *
   * Response: 200 OK
   * {
   *   "message": "Alamat berhasil dijadikan default",
   *   "data": { ... }
   * }
   */
  @Put(':id/set-default')
  async setDefaultAddress(
    @CurrentUser() user: User,
    @Param('id') addressId: string,
  ) {
    const address = await this.addressService.setDefaultAddress(
      addressId,
      user.id,
    );
    return {
      message: 'Alamat berhasil dijadikan default',
      data: address,
    };
  }

  /**
   * DELETE /auth/addresses/:id
   * Delete address (soft delete)
   *
   * @param user - Current user (from token)
   * @param addressId - Address ID
   *
   * @example
   * DELETE /auth/addresses/uuid
   * Authorization: Bearer JWT_TOKEN
   *
   * Response: 200 OK
   * {
   *   "message": "Alamat berhasil dihapus"
   * }
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteAddress(
    @CurrentUser() user: User,
    @Param('id') addressId: string,
  ) {
    await this.addressService.deleteAddress(addressId, user.id);
    return {
      message: 'Alamat berhasil dihapus',
    };
  }
}
