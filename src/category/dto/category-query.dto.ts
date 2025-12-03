import { IsOptional, IsNumberString, IsString } from 'class-validator';

export class CategoryQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sort?: string; // e.g. "name", "-createdAt"

  @IsOptional()
  @IsString()
  status?: string; // active | inactive
}
