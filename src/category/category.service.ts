import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Model, Types } from 'mongoose';
import { Category } from './schema/category.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CategoryQueryDto } from './dto/category-query.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryService>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const created = new this.categoryModel(createCategoryDto);
      const result = await created.save();
      return {
        data: result,
        message: 'Category created successfully',
      };
    } catch (err: any) {
      if (err.code === 11000) {
        throw new BadRequestException(
          'Category with same slug or name already exists',
        );
      }
      throw err;
    }
  }

  async findAll(query: CategoryQueryDto) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.max(Number(query.limit ?? 10), 1);
    const skip = (page - 1) * limit;

    const filter: any = {};

    // ✅ STATUS FILTER
    if (query.status) {
      filter.status = query.status;
    }

    // ✅ SEARCH FILTER
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { slug: { $regex: query.search, $options: 'i' } },
      ];
    }

    // ✅ SORT
    let sort: any = { createdAt: -1 };
    if (query.sort) {
      const field = query.sort.replace('-', '');
      sort = query.sort.startsWith('-') ? { [field]: -1 } : { [field]: 1 };
    }

    const [data, total] = await Promise.all([
      this.categoryModel.find(filter).sort(sort).skip(skip).limit(limit),
      this.categoryModel.countDocuments(filter),
    ]);

    return {
      message: 'Categories fetched successfully',
      data: {
        page,
        limit,
        total,
        data,
      },
    };
  }

  async findOne(idOrSlug: string) {
    let result;

    if (Types.ObjectId.isValid(idOrSlug)) {
      result = await this.categoryModel.findById(idOrSlug);
    } else {
      result = await this.categoryModel.findOne({ slug: idOrSlug });
    }

    if (!result) {
      throw new NotFoundException('Category not found');
    }

    return {
      data: result,
      message: 'Category fetched successfully',
    };
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const updatePayload: any = { ...dto };
    if (dto.name && !dto.slug) {
      updatePayload.slug = (dto.name as string)
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    }

    const updated = await this.categoryModel
      .findByIdAndUpdate(id, updatePayload, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Category not found');
    return { data: updated, message: 'Category updated successfully' };
  }

  async remove(id: string) {
    const deleted = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Category not found');
    return { message: 'Category deleted successfully' };
  }
}
