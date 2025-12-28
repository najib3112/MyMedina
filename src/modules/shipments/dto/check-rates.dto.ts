// src/shipment/dto/check-rates.dto.ts
import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class ItemDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  value: number;

  @IsNumber()
  @Min(1)
  length: number;

  @IsNumber()
  @Min(1)
  width: number;

  @IsNumber()
  @Min(1)
  height: number;

  @IsNumber()
  @Min(1)
  weight: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CheckRatesDto {
  // ✅ Support both area_id dan postal_code
  @IsOptional()
  @IsString()
  origin_area_id?: string;

  @IsOptional()
  @IsString()
  destination_area_id?: string;

  @IsOptional()
  @IsNumber()
  origin_postal_code?: number;

  @IsOptional()
  @IsNumber()
  destination_postal_code?: number;

  @IsOptional()
  @IsString()
  couriers?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];
}
