import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindAllDto } from './dto/find-all.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto, @Req() request) {
    const {
      user: { email },
    } = request;
    return await this.productsService.create(createProductDto, email);
  }

  @Get()
  async findAll(@Body() { home_id }: FindAllDto, @Req() request) {
    const {
      user: { email },
    } = request;
    return await this.productsService.findAll(home_id, email);
  }

  @Get(':product_id')
  findOne(
    @Param('product_id') product_id: string,
    @Body() { home_id }: FindAllDto,
    @Req() request,
  ) {
    const {
      user: { email },
    } = request;
    return this.productsService.findOne(home_id, email, +product_id);
  }

  @Patch(':product_id')
  update(
    @Param('product_id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() request,
  ) {
    const {
      user: { email },
    } = request;
    return this.productsService.update(email, +id, updateProductDto);
  }

  @Delete(':product_id')
  remove(@Param('product_id') id: string, @Req() request) {
    const {
      user: { email },
    } = request;
    return this.productsService.remove(email, +id);
  }
}
