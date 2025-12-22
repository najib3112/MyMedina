import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../entities/address.entity';
import { User } from '../entities/user.entity';
import {
  CreateAddressDto,
  UpdateAddressDto,
  AddressDto,
} from '../dto/address.dto';

/**
 * Address Service
 *
 * Business logic untuk manage user addresses:
 * - Create new address
 * - Get all addresses
 * - Get single address
 * - Update address
 * - Delete address
 * - Set default address
 *
 * OOP Concepts:
 * - Encapsulation: Business logic dalam service
 * - Abstraction: Database operations disembunyikan
 * - Single Responsibility: Hanya handle address logic
 *
 * Design Pattern:
 * - Dependency Injection: Repository injected via constructor
 * - Repository Pattern: Abstract database operations
 */
@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create new address untuk user
   * Jika isDefault = true, unset default address yang lama
   *
   * @param userId - User ID
   * @param dto - CreateAddressDto
   * @returns Newly created address
   */
  async createAddress(
    userId: string,
    dto: CreateAddressDto,
  ): Promise<AddressDto> {
    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Jika isDefault = true, unset default address yang lama
    if (dto.isDefault) {
      await this.addressRepository.update(
        { userId, isDefault: true },
        { isDefault: false },
      );
    }

    // Create new address
    const address = this.addressRepository.create({
      ...dto,
      userId,
      latitude: dto.latitude ? parseFloat(dto.latitude) : undefined,
      longitude: dto.longitude ? parseFloat(dto.longitude) : undefined,
    });

    const savedAddress = await this.addressRepository.save(address);

    return this.mapToDto(savedAddress);
  }

  /**
   * Get all addresses untuk user
   * Hanya menampilkan active addresses
   *
   * @param userId - User ID
   * @returns List of addresses
   */
  async getAddresses(userId: string): Promise<AddressDto[]> {
    const addresses = await this.addressRepository.find({
      where: { userId, aktif: true },
      order: { isDefault: 'DESC', dibuatPada: 'DESC' },
    });

    return addresses.map((addr) => this.mapToDto(addr));
  }

  /**
   * Get all addresses (including inactive)
   * Untuk admin purposes
   *
   * @param userId - User ID
   * @returns List of all addresses
   */
  async getAllAddresses(userId: string): Promise<AddressDto[]> {
    const addresses = await this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', dibuatPada: 'DESC' },
      withDeleted: true,
    });

    return addresses.map((addr) => this.mapToDto(addr));
  }

  /**
   * Get single address
   *
   * @param addressId - Address ID
   * @param userId - User ID (untuk security)
   * @returns Address details
   */
  async getAddress(addressId: string, userId: string): Promise<AddressDto> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Alamat tidak ditemukan');
    }

    return this.mapToDto(address);
  }

  /**
   * Get default address untuk user
   * Jika tidak ada default, return address terbaru
   *
   * @param userId - User ID
   * @returns Default address atau undefined
   */
  async getDefaultAddress(userId: string): Promise<AddressDto | null> {
    let address = await this.addressRepository.findOne({
      where: { userId, isDefault: true, aktif: true },
    });

    // Jika tidak ada default, ambil yang terbaru
    if (!address) {
      address = await this.addressRepository.findOne({
        where: { userId, aktif: true },
        order: { dibuatPada: 'DESC' },
      });
    }

    return address ? this.mapToDto(address) : null;
  }

  /**
   * Update address
   *
   * @param addressId - Address ID
   * @param userId - User ID (untuk security)
   * @param dto - UpdateAddressDto
   * @returns Updated address
   */
  async updateAddress(
    addressId: string,
    userId: string,
    dto: UpdateAddressDto,
  ): Promise<AddressDto> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Alamat tidak ditemukan');
    }

    // Jika isDefault diubah ke true, unset default yang lama
    if (dto.isDefault === true && !address.isDefault) {
      await this.addressRepository.update(
        { userId, isDefault: true },
        { isDefault: false },
      );
    }

    // Update address
    const updateData = {
      ...dto,
      latitude: dto.latitude ? parseFloat(dto.latitude) : undefined,
      longitude: dto.longitude ? parseFloat(dto.longitude) : undefined,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    await this.addressRepository.update({ id: addressId }, updateData);

    const updatedAddress = await this.addressRepository.findOne({
      where: { id: addressId },
    });

    if (!updatedAddress) {
      throw new NotFoundException('Alamat tidak ditemukan setelah update');
    }

    return this.mapToDto(updatedAddress);
  }

  /**
   * Delete address (soft delete)
   *
   * @param addressId - Address ID
   * @param userId - User ID (untuk security)
   */
  async deleteAddress(addressId: string, userId: string): Promise<void> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Alamat tidak ditemukan');
    }

    // Jika address ini default, unset flag defaultnya
    if (address.isDefault) {
      await this.addressRepository.update(
        { id: addressId },
        { isDefault: false },
      );
    }

    // Soft delete
    await this.addressRepository.softDelete({ id: addressId });
  }

  /**
   * Permanently delete address (hard delete)
   * Hanya untuk admin purposes
   *
   * @param addressId - Address ID
   */
  async permanentlyDeleteAddress(addressId: string): Promise<void> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId },
      withDeleted: true,
    });

    if (!address) {
      throw new NotFoundException('Alamat tidak ditemukan');
    }

    await this.addressRepository.remove(address);
  }

  /**
   * Set address sebagai default
   * Unset default address yang lama
   * Menggunakan method entity: setAsDefault()
   *
   * @param addressId - Address ID
   * @param userId - User ID
   */
  async setDefaultAddress(
    addressId: string,
    userId: string,
  ): Promise<AddressDto> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Alamat tidak ditemukan');
    }

    // Unset default yang lama
    await this.addressRepository.update(
      { userId, isDefault: true },
      { isDefault: false },
    );

    // Gunakan method entity: setAsDefault()
    address.setAsDefault();

    // Set new default
    await this.addressRepository.update({ id: addressId }, { isDefault: true });

    const updatedAddress = await this.addressRepository.findOne({
      where: { id: addressId },
    });

    if (!updatedAddress) {
      throw new NotFoundException('Alamat tidak ditemukan setelah update');
    }

    return this.mapToDto(updatedAddress);
  }

  /**
   * Get full address string
   * Menggunakan method entity: getAlamatLengkap()
   *
   * @param addressId - Address ID
   * @returns Full address string
   */
  async getFullAddress(addressId: string): Promise<string> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Alamat tidak ditemukan');
    }

    // Gunakan method entity: getAlamatLengkap()
    return address.getAlamatLengkap();
  }

  /**
   * Deactivate address
   * Address tetap ada di database tapi tidak ditampilkan di list
   *
   * @param addressId - Address ID
   * @param userId - User ID
   */
  async deactivateAddress(addressId: string, userId: string): Promise<void> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Alamat tidak ditemukan');
    }

    // Unset default jika ini default address
    const updateData: any = { aktif: false };
    if (address.isDefault) {
      updateData.isDefault = false;
    }

    await this.addressRepository.update({ id: addressId }, updateData);
  }

  /**
   * Reactivate address
   *
   * @param addressId - Address ID
   * @param userId - User ID
   */
  async reactivateAddress(addressId: string, userId: string): Promise<void> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
      withDeleted: true,
    });

    if (!address) {
      throw new NotFoundException('Alamat tidak ditemukan');
    }

    // Restore jika di-soft delete
    await this.addressRepository.restore({ id: addressId });

    // Set active
    await this.addressRepository.update({ id: addressId }, { aktif: true });
  }

  /**
   * Get address count untuk user
   *
   * @param userId - User ID
   * @returns Number of active addresses
   */
  async getAddressCount(userId: string): Promise<number> {
    return this.addressRepository.count({ where: { userId, aktif: true } });
  }

  /**
   * Map Address entity ke AddressDto
   */
  private mapToDto(address: Address): AddressDto {
    return {
      id: address.id,
      label: address.label,
      namaPenerima: address.namaPenerima,
      teleponPenerima: address.teleponPenerima,
      alamatBaris1: address.alamatBaris1,
      alamatBaris2: address.alamatBaris2,
      kota: address.kota,
      provinsi: address.provinsi,
      kodePos: address.kodePos,
      latitude: address.latitude ? Number(address.latitude) : undefined,
      longitude: address.longitude ? Number(address.longitude) : undefined,
      isDefault: address.isDefault,
      aktif: address.aktif,
      dibuatPada: address.dibuatPada,
      diupdatePada: address.diupdatePada,
    };
  }
}
