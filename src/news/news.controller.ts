import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsQueryDto } from './dto/news-query.dto';
import { CreateNewsDto } from './dto/create-news.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('scrape')
  scrape(@Query('query') query = 'bitcoin') {
    return this.newsService.fetchAndStoreNews(query);
  }

  @Get()
  findAll(@Query() query: NewsQueryDto) {
    return this.newsService.findAll(query);
  }

  // CRUD

  @Post()
  create(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.create(createNewsDto);
  }

  // @Post('generate-slugs')
  // generateSlugs() {
  //   return this.newsService.generateSlugsForOldNews();
  // }
}
