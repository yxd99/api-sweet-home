import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { HomesService } from 'src/homes/homes.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly homesService: HomesService,
  ) {}

  async create(createProductDto: CreateProductDto, email: string) {
    const { home_id, ...rest } = createProductDto;
    const home = await this.homesService.getHouseInfo(home_id, email);
    const newProduct = await this.productRepository.save({
      home,
      ...rest,
    });
    return {
      msg: `${newProduct.name} has been added to home ${home.name}`,
    };
  }

  async findAll(home_id: number, email: string) {
    await this.homesService.getHouseInfo(home_id, email);
    const products = await this.productRepository.find({
      relations: [],
      where: {
        home: {
          id: home_id,
        },
      },
    });

    return products;
  }

  async findOne(home_id: number, email: string, id: number) {
    await this.homesService.getHouseInfo(home_id, email);
    const product = await this.productRepository.findOne({
      relations: [],
      where: {
        id: id,
      },
    });
    return product;
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
    if (Object.keys(updateProductDto).includes('home_id')) {
      const { home_id } = updateProductDto;
      await this.homesService.getHouseInfo(home_id, email);
      product.home = await this.homesService.getHouseInfo(home_id, email);
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
