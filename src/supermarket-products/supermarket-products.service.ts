import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupermarketProductDto } from './dto/create-supermarket-product.dto';
import { UpdateSupermarketProductDto } from './dto/update-supermarket-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SupermarketProduct } from './entities/supermarket-product.entity';
import { Repository } from 'typeorm';
import { PersonalMarketsService } from 'src/personal_markets/personal_markets.service';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class SupermarketProductsService {
  constructor(
    @InjectRepository(SupermarketProduct)
    private readonly supermarketProductsRepository: Repository<SupermarketProduct>,
    private readonly marketsService: PersonalMarketsService,
    private readonly productsService: ProductsService,
  ) {}

  async create(
    createSupermarketProductDto: CreateSupermarketProductDto,
    email: string,
  ) {
    const product = await this.productsService.findOne(
      email,
      createSupermarketProductDto.product_id,
    );
    if (product === null)
      return { msg: `${createSupermarketProductDto.product_id} no exist` };
    const market = await this.marketsService.findOne(
      createSupermarketProductDto.market_id,
      email,
    );
    if (market === null)
      return { msg: `${createSupermarketProductDto.market_id} no exist` };

    if (await this.validateIfExist(market.id, product.id))
      throw new BadRequestException('The product is already in this market');
    await this.supermarketProductsRepository.save({
      cost: createSupermarketProductDto.cost,
      market,
      product,
    });
    return {
      msg: `product ${product.name} has been add to market ${market.name}`,
    };
  }

  async findAll(
    email: string,
    market_id: number,
  ): Promise<SupermarketProduct[]> {
    const products: SupermarketProduct[] =
      market_id === null
        ? await this.supermarketProductsRepository.find({
            relations: ['market'],
            where: {
              market: {
                home: {
                  household_members: {
                    user: {
                      email,
                    },
                  },
                },
              },
            },
          })
        : await this.supermarketProductsRepository.find({
            relations: ['market'],
            where: {
              market: {
                id: market_id,
                home: {
                  household_members: {
                    user: {
                      email,
                    },
                  },
                },
              },
            },
          });
    return products;
  }

  async findOne(email: string, id: number): Promise<SupermarketProduct> {
    const product = await this.supermarketProductsRepository.findOneBy({
      id,
      market: { home: { household_members: { user: { email } } } },
    });
    if (product === null)
      throw new NotFoundException('Product not found in any market');
    return product;
  }

  async update(
    email: string,
    id: number,
    updateSupermarketProductDto: UpdateSupermarketProductDto,
  ) {
    const product = await this.supermarketProductsRepository.findOne({
      relations: ['product', 'market'],
      where: {
        id,
        market: {
          home: {
            household_members: {
              user: {
                email,
              },
            },
          },
        },
      },
    });
    if (product === null)
      throw new NotFoundException('Product not found in any market');

    if (updateSupermarketProductDto?.market_id) {
      product.market = await this.marketsService.findOne(
        updateSupermarketProductDto.market_id,
        email,
      );
    }
    if (updateSupermarketProductDto?.product_id) {
      product.product = await this.productsService.findOne(
        email,
        updateSupermarketProductDto.product_id,
      );
    }

    if (await this.validateIfExist(product.market.id, product.product.id))
      throw new BadRequestException('The product is already in this market');
    await this.supermarketProductsRepository.save(product);
    return { msg: 'Product has been updated' };
  }

  async remove(email: string, id: number) {
    const product = await this.supermarketProductsRepository.findOneBy({
      id,
      market: {
        home: {
          household_members: {
            user: {
              email,
            },
          },
        },
      },
    });
    if (product === null) throw new NotFoundException('Product not found');
    await this.supermarketProductsRepository.delete(product);
    return {
      msg: 'Product has been deleted',
    };
  }

  async validateIfExist(market_id: number, product_id: number) {
    return await this.supermarketProductsRepository.exist({
      where: {
        market: {
          id: market_id,
        },
        product: {
          id: product_id,
        },
      },
    });
  }
}
