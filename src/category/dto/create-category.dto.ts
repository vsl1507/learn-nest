import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CategoryStatus } from '../schema/category.schema';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  slug: string;

  @IsOptional()
  @IsEnum(CategoryStatus)
  status: CategoryStatus;

  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}
