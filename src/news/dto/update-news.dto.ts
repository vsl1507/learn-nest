import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

import { CreateNewsDto } from './create-news.dto';

export class UpdateNewsDto extends PartialType(CreateNewsDto) {
  @ApiPropertyOptional({
    example: 'Bitcoin breaks $120,000',
    description: 'Updated headline of the news article',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'https://news.com/bitcoin-120k',
    description: 'Updated original article URL (must remain unique)',
  })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['65fa9c1...', '66ab812...'],
    description: 'Updated category IDs (MongoDB ObjectIds)',
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  categories?: string[];

  @ApiPropertyOptional({
    example: 'Bitcoin reaches a new historical high after ETF expansion.',
    description: 'Updated short description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'The BTC rally accelerated as institutional volume increased...',
    description: 'Updated full content of the news article',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.site.com/news/bitcoin-new.jpg',
    description: 'Updated cover image URL',
  })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiPropertyOptional({
    example: 'Bloomberg',
    description: 'Updated news source or publisher',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    example: '2025-12-03T08:30:00.000Z',
    description: 'Updated publish date (ISO format)',
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: Date;
}
