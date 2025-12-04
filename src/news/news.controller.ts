import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { NewsService } from './news.service';
import { NewsQueryDto } from './dto/news-query.dto';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@ApiTags('News')
// @ApiBearerAuth()// Enble authenication
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('scrape')
  @ApiOperation({ summary: 'Scrape news from NewsAPI and store into database' })
  @ApiQuery({
    name: 'query',
    required: false,
    example: 'bitcoin',
    description: 'Search keyword for scraping news',
  })
  @ApiResponse({
    status: 200,
    description: 'News scraped and saved successfully',
  })
  scrape(@Query('query') query = 'bitcoin') {
    return this.newsService.fetchAndStoreNews(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new news article' })
  @ApiBody({ type: CreateNewsDto })
  @ApiResponse({ status: 201, description: 'News created successfully' })
  @ApiBadRequestResponse({ description: 'Duplicate slug or URL' })
  create(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.create(createNewsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of news articles' })
  @ApiResponse({ status: 200, description: 'Paginated news list' })
  findAll(@Query() query: NewsQueryDto) {
    return this.newsService.findAll(query);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get a single news article by ID or slug' })
  @ApiParam({
    name: 'idOrSlug',
    example: '65fab12e98c3a1b4f4e9c111',
    description: 'MongoDB ObjectId or slug value',
  })
  @ApiOkResponse({ description: 'News found' })
  @ApiNotFoundResponse({ description: 'News not found' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.newsService.findOne(idOrSlug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing news article' })
  @ApiParam({
    name: 'id',
    example: '65fab12e98c3a1b4f4e9c111',
    description: 'MongoDB ObjectId',
  })
  @ApiBody({ type: UpdateNewsDto })
  @ApiResponse({ status: 200, description: 'News updated successfully' })
  @ApiBadRequestResponse({ description: 'Duplicate slug or URL' })
  @ApiNotFoundResponse({ description: 'News not found' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  update(@Param('id') id: string, @Body() updateNewsDto: UpdateNewsDto) {
    return this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a news article' })
  @ApiParam({
    name: 'id',
    example: '65fab12e98c3a1b4f4e9c111',
    description: 'MongoDB ObjectId',
  })
  @ApiResponse({ status: 200, description: 'News deleted successfully' })
  @ApiNotFoundResponse({ description: 'News not found' })
  remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }
}
