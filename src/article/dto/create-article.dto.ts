import { IsString } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  content: string;

  @IsString()
  thumbnail: string;

}
