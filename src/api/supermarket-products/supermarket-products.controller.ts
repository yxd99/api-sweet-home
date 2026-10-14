import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';

import { CreateSupermarketProductDto } from './dto/create-supermarket-product.dto';
import { UpdateSupermarketProductDto } from './dto/update-supermarket-product.dto';
import { SupermarketProductsService } from './supermarket-products.service';

@Controller('supermarket-products')
export class SupermarketProductsController {
  constructor(
    private readonly supermarketProductsService: SupermarketProductsService,
  ) {}

  @Post()
  create(
    @Body() createSupermarketProductDto: CreateSupermarketProductDto,
    @Req() request,
  ) {
    const {
      user: { id: userId },
    } = request;
    return this.supermarketProductsService.create(
      createSupermarketProductDto,
      userId,
    );
  }

  @Get()
  findAll(
    @Query('market_id', new ParseIntPipe({ optional: true })) marketId: number,
    @Req() request,
  ) {
    const {
      user: { id: userId },
    } = request;
    return this.supermarketProductsService.findAll(userId, marketId ?? null);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() request) {
    const {
      user: { id: userId },
    } = request;
    return this.supermarketProductsService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupermarketProductDto: UpdateSupermarketProductDto,
    @Req() request,
  ) {
    const {
      user: { id: userId },
    } = request;
    return this.supermarketProductsService.update(
      userId,
      id,
      updateSupermarketProductDto,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() request) {
    const {
      user: { id: userId },
    } = request;
    return this.supermarketProductsService.remove(userId, id);
  }
}
