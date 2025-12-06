import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { News } from './schemas/news.schema';
import { HttpService } from '@nestjs/axios';
import { NewsQueryDto } from './dto/news-query.dto';
import { Category } from 'src/category/schema/category.schema';
import { ConfigService } from '@nestjs/config';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import NewsAPI from 'newsapi';
import slugify from 'slugify';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class NewsService {
  private newsapi: NewsAPI;

  constructor(
    @InjectModel(News.name) private newsModel: Model<News>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.newsapi = new NewsAPI(this.configService.get<string>('NEWS_API_KEY')!);
  }

  async fetchAndStoreNews(query: string) {
    const response = await this.newsapi.v2.everything({
      q: query,
      language: 'en',
      sortBy: 'publishedAt',
      page: 1,
    });

    if (response.status !== 'ok') {
      throw new Error('Failed to fetch news');
    }

    const savedArticles: News[] = [];

    for (const article of response.articles) {
      const exists = await this.newsModel.exists({
        url: article.url,
      });

      if (exists) continue; // ✅ PREVENT DUPLICATES

      const textForTagging = `${article.title} ${article.description || ''}`;

      const categoryIds = await this.autoDetectCategories(textForTagging);

      const created = await this.newsModel.create({
        title: article.title,
        description: article.description,
        image: article.urlToImage,
        url: article.url,
        source: article.source?.name,
        publishedAt: article.publishedAt,
        categories: categoryIds,
      });

      savedArticles.push(created);
    }

    return {
      success: true,
      message: 'News imported successfully',
      total: savedArticles.length,
      data: savedArticles,
    };
  }

  async create(createNewsDto: CreateNewsDto) {
    try {
      if (!createNewsDto.publishedAt) {
        createNewsDto.publishedAt = new Date();
      }

      if (createNewsDto.categories?.length) {
        const categoryCount = await this.categoryModel.countDocuments({
          _id: { $in: createNewsDto.categories },
        });

        if (categoryCount !== createNewsDto.categories.length) {
          throw new NotFoundException('One or more categories do not exist');
        }
      }

      const created = new this.newsModel(createNewsDto);
      const result = await created.save();
      return {
        data: result,
        message: 'News created successfully!',
      };
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException(
          'News with same slug or url already exists',
        );
      }
      throw error;
    }
  }

  async findAll(query: NewsQueryDto) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.max(Number(query.limit ?? 10), 1);
    const skip = (page - 1) * limit;

    const filter: any = {};

    // ✅ SEARCH
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { content: { $regex: query.search, $options: 'i' } },
      ];
    }

    // ✅ CATEGORY FILTER BY ID
    if (query.categoryId) {
      if (Types.ObjectId.isValid(query.categoryId)) {
        filter.categories = query.categoryId; // Keep as string for raw query
      }
    }

    // ✅ CATEGORY FILTER BY SLUG
    if (query.categorySlug && !query.categoryId) {
      const category = await this.categoryModel.findOne({
        slug: query.categorySlug,
      });

      if (category) {
        filter.categories = category._id.toString();
      } else {
        return {
          message: 'News fetched successfully',
          data: {
            page,
            limit,
            total: 0,
            data: [],
          },
        };
      }
    }

    // ✅ SORT
    let sort: any = { publishedAt: -1 };
    if (query.sort) {
      const field = query.sort.replace('-', '');
      sort = query.sort.startsWith('-') ? { [field]: -1 } : { [field]: 1 };
    }

    const rawCollection = this.newsModel.collection;

    const [rawResults, total] = await Promise.all([
      rawCollection.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
      rawCollection.countDocuments(filter),
    ]);

    const categoryIds = [
      ...new Set(rawResults.flatMap((r) => r.categories || [])),
    ];

    const categories = await this.categoryModel
      .find({
        _id: { $in: categoryIds.map((id) => new Types.ObjectId(id)) },
      })
      .select('name slug')
      .lean();

    const categoryMap = new Map(
      categories.map((cat) => [cat._id.toString(), cat]),
    );

    const result = rawResults.map((news) => ({
      ...news,
      categories: (news.categories || [])
        .map((catId) => categoryMap.get(catId))
        .filter(Boolean),
    }));

    return {
      message: 'News fetched successfully',
      data: {
        page,
        limit,
        total,
        data: result,
      },
    };
  }

  async findOne(idOrSlug: string) {
    let result;

    if (Types.ObjectId.isValid(idOrSlug)) {
      result = await this.newsModel.findById(idOrSlug);
    } else {
      result = await this.newsModel.findOne({ slug: idOrSlug });
    }

    if (!result) {
      throw new NotFoundException('Category not found');
    }

    return {
      data: result,
      message: 'News fetched successfully!',
    };
  }

  async update(id: string, dto: UpdateNewsDto) {
    try {
      const updatePayload: any = { ...dto };

      if (dto.url) {
        const urlExist = await this.newsModel.exists({
          url: dto.url,
          _id: { $ne: id },
        });
        if (urlExist) {
          throw new BadRequestException('Aother news aleady use this URL.');
        }
      }

      if (dto.title) {
        let baseSlug = slugify(dto.title, {
          lower: true,
          strict: true,
        });

        let slug = baseSlug;
        let counter = 1;

        while (
          await this.newsModel.exists({
            slug,
            _id: { $ne: id },
          })
        ) {
          slug = `${baseSlug}-${counter++}`;
        }

        updatePayload.slug = slug;
      }

      const updated = await this.newsModel
        .findByIdAndUpdate(id, updatePayload, { new: true })
        .exec();
      if (!updated) throw new NotFoundException('News not found');
      return { data: updated, message: 'News updated successfully' };
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new BadRequestException('Slug or URL already exists');
      }

      throw error;
    }
  }

  async remove(id: string) {
    const deleted = await this.newsModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('News not found');
    return { message: 'News deleted successfully' };
  }

  // Function for create category by keywords
  private async autoDetectCategories(text: string): Promise<string[]> {
    const content = text.toLowerCase();
    const categories = await this.categoryModel.find({
      status: 'active',
    });

    const matchedCategoryIds: string[] = [];

    for (const category of categories) {
      const matched = category.keywords.some((keyword) =>
        content.includes(keyword.toLowerCase()),
      );

      if (matched) {
        matchedCategoryIds.push(category._id.toString());
      }
    }

    return matchedCategoryIds;
  }

  // Add slug to old news or data
  // async generateSlugsForOldNews() {
  //   const newsList = await this.newsModel.find({
  //     $or: [{ slug: { $exists: false } }, { slug: '' }],
  //   });

  //   let updatedCount = 0;

  //   for (const news of newsList) {
  //     let baseSlug = slugify(news.title, {
  //       lower: true,
  //       strict: true,
  //     });

  //     let slug = baseSlug;
  //     let counter = 1;

  //     while (
  //       await this.newsModel.exists({
  //         slug,
  //         _id: { $ne: news._id }, // ✅ exclude current doc
  //       })
  //     ) {
  //       slug = `${baseSlug}-${counter++}`;
  //     }

  //     news.slug = slug;
  //     await news.save();
  //     updatedCount++;
  //   }

  //   return {
  //     success: true,
  //     message: 'Old news slugs generated successfully',
  //     totalUpdated: updatedCount,
  //   };
  // }

  //   @Cron('0 */30 * * * *')
  //   async autoScrape() {
  //     console.log('Auto scraping news...');
  //     await this.fetchAndStoreNews();
  //   }
}
