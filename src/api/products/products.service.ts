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

  async create(createProductDto: CreateProductDto, email: string) {
    const { homeId, ...rest } = createProductDto;
    const home = await this.homesService.getHouseInfo(homeId, email);
    const newProduct = await this.productRepository.save({
      home,
      ...rest,
    });
    return {
      msg: `${newProduct.name} has been added to home ${home.name}`,
    };
  }

  async findAll(homeId: number, email: string) {
    await this.homesService.getHouseInfo(homeId, email);
    return this.productRepository.find({
      relations: [],
      where: {
        home: {
          id: homeId,
        },
      },
    });
  }

  async findOne(homeId: number, email: string, id: number) {
    await this.homesService.getHouseInfo(homeId, email);
    return this.productRepository.findOne({
      relations: [],
      where: {
        id,
      },
    });
  }

  async update(email: string, id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOne({
      relations: ['home'],
      where: {
        id,
      },
    });
    if (product === null)
      throw new NotFoundException(`Id product ${id} not exist`);
    await this.homesService.getHouseInfo(product.home.id, email);
    if (Object.keys(updateProductDto).includes('homeId')) {
      const { homeId } = updateProductDto;
      await this.homesService.getHouseInfo(homeId, email);
      product.home = await this.homesService.getHouseInfo(homeId, email);
    }
    await this.productRepository.save(product);

    return {
      msg: 'Product has been updated',
    };
  }

  async remove(email: string, id: number) {
    await this.homesService.getHouseInfo(id, email);
    await this.productRepository.delete(id);
    return { msg: `Product ${id} has been delete successfully` };
  }
}
