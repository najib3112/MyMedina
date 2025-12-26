import { IsOptional, IsDateString } from 'class-validator';

/**
 * Date Range Filter DTO for Reports
 */
export class DateRangeDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
