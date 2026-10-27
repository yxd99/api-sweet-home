import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ParseIntPipe,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';

import { CreateProductDto } from './dto/create-product.dto';
import { FindAllDto } from './dto/find-all.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto, @Req() request) {
    const {
      user: { id: userId },
    } = request;
    return this.productsService.create(createProductDto, userId);
  }

  @Get()
  async findAll(
    @Query() query: FindAllDto,
    @Headers('x-home-id') homeIdHeader: string,
    @Req() request,
  ) {
    const {
      user: { id: userId },
    } = request;
    const homeId = query?.homeId ?? homeIdHeader;
    if (!homeId) {
      throw new BadRequestException('homeId is required');
    }
    return this.productsService.findAll(Number(homeId), userId);
  }

  @Get(`:productId`)
  findOne(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('homeId') homeIdQuery: string,
    @Headers('x-home-id') homeIdHeader: string,
    @Body() body: FindAllDto,
    @Req() request,
  ) {
    const {
      user: { id: userId },
    } = request;
    const homeId = homeIdQuery ?? body?.homeId ?? homeIdHeader;
    if (!homeId) {
      throw new BadRequestException('homeId is required');
    }
    return this.productsService.findOne(Number(homeId), userId, productId);
  }


  @Patch(`:productId`)
  update(
    @Param('productId', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Req() request,
  ) {
    const {
      user: { id: userId },
    } = request;
    return this.productsService.update(userId, id, updateProductDto);
  }

  @Delete(`:productId`)
  remove(@Param('productId', ParseIntPipe) id: number, @Req() request) {
    const {
      user: { id: userId },
    } = request;
    return this.productsService.remove(userId, id);
  }
}
