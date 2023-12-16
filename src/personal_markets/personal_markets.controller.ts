import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { PersonalMarketsService } from './personal_markets.service';
import { CreatePersonalMarketDto } from './dto/create-personal_market.dto';
import { UpdatePersonalMarketDto } from './dto/update-personal_market.dto';
import { FindAllDto } from './dto/find-all.dto';

@Controller('personal-markets')
export class PersonalMarketsController {
  constructor(
    private readonly personalMarketsService: PersonalMarketsService,
  ) {}

  @Post()
  async create(
    @Body() createPersonalMarketDto: CreatePersonalMarketDto,
    @Req() request,
  ) {
    const {
      user: { email },
    } = request;
    return await this.personalMarketsService.create(
      createPersonalMarketDto,
      email,
    );
  }

  @Get()
  async findAll(@Body() { home_id }: FindAllDto, @Req() request) {
    const {
      user: { email },
    } = request;

    return await this.personalMarketsService.findAll(+home_id, email);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request) {
    const {
      user: { email },
    } = request;

    return this.personalMarketsService.findOne(+id, email);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePersonalMarketDto: UpdatePersonalMarketDto,
    @Req() request,
  ) {
    const {
      user: { email },
    } = request;

    return this.personalMarketsService.update(
      +id,
      updatePersonalMarketDto,
      email,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personalMarketsService.remove(+id);
  }
}
