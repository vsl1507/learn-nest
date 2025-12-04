import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { News, NewsSchema } from './schemas/news.schema';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { CategoryModule } from 'src/category/category.module';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([{ name: News.name, schema: NewsSchema }]),
    CategoryModule,
  ],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
