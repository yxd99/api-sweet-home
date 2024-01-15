import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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
  async findAll(@Query('home_id') home_id, @Req() request) {
    const {
      user: { email },
    } = request;
    return await this.productsService.findAll(+home_id || null, email);
  }

  @Get(':product_id')
  findOne(@Param('product_id') product_id: string, @Req() request) {
    const {
      user: { email },
    } = request;
    return this.productsService.findOne(email, +product_id);
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
