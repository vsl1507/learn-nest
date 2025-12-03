import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { timestamp } from 'rxjs';

export type CategoryDocument = Category & Document;

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

function slugify(str: string) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: false, unique: true })
  slug: string;

  @Prop({
    required: true,
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
  })
  status: CategoryStatus;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.pre<CategoryDocument>('save', function () {
  if (!this.slug || this.isModified('name')) {
    this.slug = slugify(this.name);
  }
});
