import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ArticleModule } from './article/article.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://visaljudan:visal12345@visaljudan.alyvn.mongodb.net/test-api',
    ),
    UsersModule,
    ArticleModule,
    CategoryModule,
  ],
})
export class AppModule {}
