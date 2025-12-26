// src/shipment/dto/check-rates.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class RatesItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama item wajib diisi' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({}, { message: 'Value harus angka' })
  @IsNotEmpty({ message: 'Value wajib diisi' })
  value: number;

  @IsNumber({}, { message: 'Length harus angka' })
  @IsNotEmpty({ message: 'Length wajib diisi' })
  length: number;

  @IsNumber({}, { message: 'Width harus angka' })
  @IsNotEmpty({ message: 'Width wajib diisi' })
  width: number;

  @IsNumber({}, { message: 'Height harus angka' })
  @IsNotEmpty({ message: 'Height wajib diisi' })
  height: number;

  @IsNumber({}, { message: 'Weight harus angka' })
  @IsNotEmpty({ message: 'Weight wajib diisi' })
  weight: number;

  @IsNumber({}, { message: 'Quantity harus angka' })
  @IsNotEmpty({ message: 'Quantity wajib diisi' })
  quantity: number;
}

export class CheckRatesDto {
  @IsString()
  @IsNotEmpty({ message: 'origin_area_id wajib diisi' })
  origin_area_id: string;

  @IsString()
  @IsNotEmpty({ message: 'destination_area_id wajib diisi' })
  destination_area_id: string;

  @IsString()
  @IsOptional()
  couriers?: string; // contoh: "jne,jnt,sicepat"

  @IsArray({ message: 'Items harus array' })
  @ValidateNested({ each: true })
  @Type(() => RatesItemDto)
  items: RatesItemDto[];
}