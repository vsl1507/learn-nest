import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { CategoryModule } from './category/category.module';
import { NewsModule } from './news/news.module';
import { ConfigModule } from '@nestjs/config';
import { OpenaiModule } from './openai/openai.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://visaljudan:visal12345@visaljudan.alyvn.mongodb.net/test-api',
    ),
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    CategoryModule,
    NewsModule,
    OpenaiModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
