import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNewsDto {
  @ApiProperty({
    example: 'Bitcoin breaks $100,000',
    description: 'Headline or title of the news article',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'https://news.com/bitcoin-100k',
    description: 'Original article URL (must be unique)',
  })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['65fa9c1...', '66ab812...'],
    description: 'Category IDs (MongoDB ObjectIds)',
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  categories?: string[];

  @ApiPropertyOptional({
    example: 'Bitcoin reaches an all-time high after ETF approval.',
    description: 'Short description or summary of the news',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'The Bitcoin price surged dramatically after...',
    description: 'Full content/body of the news article',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    example: 'https://cdn.site.com/news/bitcoin.jpg',
    description: 'Cover image URL',
  })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiPropertyOptional({
    example: 'CoinDesk',
    description: 'News source or publisher',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    example: '2025-12-02T16:56:43.359Z',
    description:
      'Publish date (ISO format). Defaults to current time if omitted.',
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: Date;
}
