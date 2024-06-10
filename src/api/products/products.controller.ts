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
      user: { userId },
    } = request;
    return this.productsService.create(createProductDto, userId);
  }

  @Get()
  async findAll(@Body() { homeId }: FindAllDto, @Req() request) {
    const {
      user: { userId },
    } = request;
    return this.productsService.findAll(homeId, userId);
  }

  @Get(`:productId`)
  findOne(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() { homeId }: FindAllDto,
    @Req() request,
  ) {
    const {
      user: { userId },
    } = request;
    return this.productsService.findOne(homeId, userId, productId);
  }

  @Patch(`:productId`)
  update(
    @Param('productId', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Req() request,
  ) {
    const {
      user: { userId },
    } = request;
    return this.productsService.update(userId, id, updateProductDto);
  }

  @Delete(`:productId`)
  remove(@Param('productId', ParseIntPipe) id: number, @Req() request) {
    const {
      user: { userId },
    } = request;
    return this.productsService.remove(userId, id);
  }
}
