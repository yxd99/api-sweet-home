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
import { SupermarketProductsService } from './supermarket-products.service';
import { CreateSupermarketProductDto } from './dto/create-supermarket-product.dto';
import { UpdateSupermarketProductDto } from './dto/update-supermarket-product.dto';

@Controller('supermarket-products')
export class SupermarketProductsController {
  constructor(
    private readonly supermarketProductsService: SupermarketProductsService,
  ) {}

  @Post()
  create(
    @Body() createSupermarketProductDto: CreateSupermarketProductDto,
    @Req() { user: { email } },
  ) {
    return this.supermarketProductsService.create(
      createSupermarketProductDto,
      email,
    );
  }

  @Get()
  findAll(@Req() { user: { email } }, @Query('market_id') market_id) {
    return this.supermarketProductsService.findAll(email, market_id || null);
  }

  @Get(':id')
  findOne(@Req() { user: { email } }, @Param('id') id: string) {
    return this.supermarketProductsService.findOne(email, +id);
  }

  @Patch(':id')
  update(
    @Req() { user: { email } },
    @Param('id') id: string,
    @Body() updateSupermarketProductDto: UpdateSupermarketProductDto,
  ) {
    return this.supermarketProductsService.update(
      email,
      +id,
      updateSupermarketProductDto,
    );
  }

  @Delete(':id')
  remove(@Req() { user: { email } }, @Param('id') id: string) {
    return this.supermarketProductsService.remove(email, +id);
  }
}
