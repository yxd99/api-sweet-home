import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HomesService } from '@api/homes/homes.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly homesService: HomesService,
  ) {}

  async create(createProductDto: CreateProductDto, userId: number) {
    const { homeId, ...rest } = createProductDto;
    const home = await this.homesService.getHouseInfo(homeId, userId);
    const newProduct = await this.productRepository.save({
      home,
      ...rest,
    });
    return {
      msg: `${newProduct.name} has been added to home ${home.name}`,
    };
  }

  async findAll(homeId: number, userId: number) {
    await this.homesService.getHouseInfo(homeId, userId);
    return this.productRepository.find({
      relations: [],
      where: {
        home: {
          id: homeId,
        },
      },
    });
  }

  async findOne(homeId: number, userId: number, id: number) {
    await this.homesService.getHouseInfo(homeId, userId);
    return this.productRepository.findOne({
      relations: [],
      where: {
        id,
      },
    });
  }

  async update(userId: number, id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOne({
      relations: ['home'],
      where: {
        id,
      },
    });
    if (product === null) {
      throw new NotFoundException(`Id product ${id} not exist`);
    }
    await this.homesService.getHouseInfo(product.home.id, userId);
    if (Object.keys(updateProductDto).includes('homeId')) {
      const { homeId } = updateProductDto;
      await this.homesService.getHouseInfo(homeId, userId);
      product.home = await this.homesService.getHouseInfo(homeId, userId);
    }
    await this.productRepository.save(product);

    return {
      msg: 'Product has been updated',
    };
  }

  async remove(userId: number, id: number) {
    await this.homesService.getHouseInfo(id, userId);
    await this.productRepository.delete(id);
    return { msg: `Product ${id} has been delete successfully` };
  }
}
