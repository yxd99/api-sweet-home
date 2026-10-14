import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PersonalMarket } from '@api/personal_markets/entities/personal_market.entity';
import { Product } from '@api/products/entities/product.entity';

import { CreateSupermarketProductDto } from './dto/create-supermarket-product.dto';
import { UpdateSupermarketProductDto } from './dto/update-supermarket-product.dto';
import { SupermarketProduct } from './entities/supermarket-product.entity';

@Injectable()
export class SupermarketProductsService {
  constructor(
    @InjectRepository(SupermarketProduct)
    private readonly supermarketProductRepository: Repository<SupermarketProduct>,
    @InjectRepository(PersonalMarket)
    private readonly personalMarketRepository: Repository<PersonalMarket>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(
    createSupermarketProductDto: CreateSupermarketProductDto,
    userId: number,
  ) {
    const market = await this.getMarketForUser(
      createSupermarketProductDto.market_id,
      userId,
    );
    const product = await this.getProductForUser(
      createSupermarketProductDto.product_id,
      userId,
    );
    if (product === null) {
      return { msg: `${createSupermarketProductDto.product_id} no exist` };
    }

    if (await this.validateIfExist(market.id, product.id)) {
      throw new BadRequestException('The product is already in this market');
    }

    await this.supermarketProductRepository.save({
      cost: createSupermarketProductDto.cost,
      market,
      product,
    });

    return {
      msg: `product ${product.name} has been add to market ${market.name}`,
    };
  }

  async findAll(
    userId: number,
    marketId: number,
  ): Promise<SupermarketProduct[]> {
    if (marketId === null) {
      return this.supermarketProductRepository.find({
        relations: { market: true },
        where: {
          market: {
            home: {
              householdMembers: {
                user: {
                  id: userId,
                },
              },
            },
          },
        },
      });
    }

    return this.supermarketProductRepository.find({
      relations: { market: true },
      where: {
        market: {
          id: marketId,
          home: {
            householdMembers: {
              user: {
                id: userId,
              },
            },
          },
        },
      },
    });
  }

  async findOne(userId: number, id: number): Promise<SupermarketProduct> {
    const product = await this.supermarketProductRepository.findOneBy({
      id,
      market: {
        home: {
          householdMembers: {
            user: {
              id: userId,
            },
          },
        },
      },
    });
    if (product === null) {
      throw new NotFoundException('Product not found in any market');
    }
    return product;
  }

  async update(
    userId: number,
    id: number,
    updateSupermarketProductDto: UpdateSupermarketProductDto,
  ) {
    const product = await this.supermarketProductRepository.findOne({
      relations: { product: true, market: true },
      where: {
        id,
        market: {
          home: {
            householdMembers: {
              user: {
                id: userId,
              },
            },
          },
        },
      },
    });
    if (product === null) {
      throw new NotFoundException('Product not found in any market');
    }

    if (updateSupermarketProductDto?.cost !== undefined) {
      product.cost = updateSupermarketProductDto.cost;
    }

    if (updateSupermarketProductDto?.market_id) {
      product.market = await this.getMarketForUser(
        updateSupermarketProductDto.market_id,
        userId,
      );
    }

    if (updateSupermarketProductDto?.product_id) {
      const newProduct = await this.getProductForUser(
        updateSupermarketProductDto.product_id,
        userId,
      );
      if (newProduct === null) {
        return { msg: `${updateSupermarketProductDto.product_id} no exist` };
      }
      product.product = newProduct;
    }

    if (
      await this.validateIfExist(
        product.market.id,
        product.product.id,
        product.id,
      )
    ) {
      throw new BadRequestException('The product is already in this market');
    }

    await this.supermarketProductRepository.save(product);

    return { msg: 'Product has been updated' };
  }

  async remove(userId: number, id: number) {
    const product = await this.supermarketProductRepository.findOneBy({
      id,
      market: {
        home: {
          householdMembers: {
            user: {
              id: userId,
            },
          },
        },
      },
    });
    if (product === null) {
      throw new NotFoundException('Product not found');
    }

    await this.supermarketProductRepository.delete(product.id);

    return {
      msg: 'Product has been deleted',
    };
  }

  private async getMarketForUser(
    marketId: number,
    userId: number,
  ): Promise<PersonalMarket> {
    const market = await this.personalMarketRepository.findOneBy({
      id: marketId,
      home: {
        householdMembers: {
          user: {
            id: userId,
          },
        },
      },
    });

    if (market === null) {
      throw new NotFoundException(`Market ${marketId} not found`);
    }

    return market;
  }

  private async getProductForUser(
    productId: number,
    userId: number,
  ): Promise<Product> {
    return this.productRepository.findOneBy({
      id: productId,
      home: {
        householdMembers: {
          user: {
            id: userId,
          },
        },
      },
    });
  }

  async validateIfExist(
    marketId: number,
    productId: number,
    excludeId: number = null,
  ) {
    const duplicate = await this.supermarketProductRepository.findOneBy({
      market: {
        id: marketId,
      },
      product: {
        id: productId,
      },
    });

    return duplicate !== null && duplicate.id !== excludeId;
  }
}
