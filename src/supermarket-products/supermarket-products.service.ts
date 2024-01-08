import { Injectable } from '@nestjs/common';
import { CreateSupermarketProductDto } from './dto/create-supermarket-product.dto';
import { UpdateSupermarketProductDto } from './dto/update-supermarket-product.dto';

@Injectable()
export class SupermarketProductsService {
  create(createSupermarketProductDto: CreateSupermarketProductDto) {
    return 'This action adds a new supermarketProduct';
  }

  findAll() {
    return `This action returns all supermarketProducts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} supermarketProduct`;
  }

  update(id: number, updateSupermarketProductDto: UpdateSupermarketProductDto) {
    return `This action updates a #${id} supermarketProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} supermarketProduct`;
  }
}
