import { IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class NewsQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number (starts from 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    example: 'bitcoin',
    description: 'Search by news title or description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'publishedAt:desc',
    description: 'Sort format: field:asc | field:desc (e.g. title:asc)',
  })
  @IsOptional()
  @IsString()
  sort?: string;
}
