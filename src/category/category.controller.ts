import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';

@ApiTags('Categories')
// @ApiBearerAuth() //Enable this if using JWT
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation error or duplicate slug',
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all categories with pagination, search & status filter',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'car' })
  @ApiQuery({ name: 'status', required: false, example: 'active' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  findAll(@Query() query: CategoryQueryDto) {
    return this.categoryService.findAll(query);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get a category by ID or slug' })
  @ApiParam({
    name: 'idOrSlug',
    example: '65abc1234 OR car',
    description: 'MongoDB ObjectId or category slug',
  })
  @ApiResponse({ status: 200, description: 'Category found' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.categoryService.findOne(idOrSlug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({
    name: 'id',
    example: '65abc1234',
    description: 'MongoDB ObjectId',
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or duplicate slug' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({
    name: 'id',
    example: '65abc1234',
    description: 'MongoDB ObjectId',
  })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
