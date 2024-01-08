import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SupermarketProductsService } from './supermarket-products.service';
import { CreateSupermarketProductDto } from './dto/create-supermarket-product.dto';
import { UpdateSupermarketProductDto } from './dto/update-supermarket-product.dto';

@Controller('supermarket-products')
export class SupermarketProductsController {
  constructor(
    private readonly supermarketProductsService: SupermarketProductsService,
  ) {}

  @Post()
  create(@Body() createSupermarketProductDto: CreateSupermarketProductDto) {
    return this.supermarketProductsService.create(createSupermarketProductDto);
  }

  @Get()
  findAll() {
    return this.supermarketProductsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supermarketProductsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSupermarketProductDto: UpdateSupermarketProductDto,
  ) {
    return this.supermarketProductsService.update(
      +id,
      updateSupermarketProductDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.supermarketProductsService.remove(+id);
  }
}
