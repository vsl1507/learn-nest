import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import slugify from 'slugify';

@Schema({ timestamps: true })
export class News extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ unique: true })
  url: string;

  @Prop({
    type: [Types.ObjectId],
    ref: 'Category',
    default: [],
  })
  categories: string[];

  @Prop()
  description: string;

  @Prop()
  content: string;

  @Prop()
  image: string;

  @Prop()
  source: string;

  @Prop()
  publishedAt: Date;
}

export const NewsSchema = SchemaFactory.createForClass(News);

NewsSchema.pre('save', async function () {
  if (!this.isModified('title')) return;

  let baseSlug = slugify(this.title, {
    lower: true,
    strict: true,
  });

  let slug = baseSlug;
  let counter = 1;

  const model = this.constructor as any;

  while (await model.exists({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  this.slug = slug;
});
