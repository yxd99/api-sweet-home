import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ParseIntPipe,
} from '@nestjs/common';

import { CreatePersonalMarketDto } from './dto/create-personal_market.dto';
import { FindAllDto } from './dto/find-all.dto';
import { UpdatePersonalMarketDto } from './dto/update-personal_market.dto';
import { PersonalMarketsService } from './personal_markets.service';

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
    return this.personalMarketsService.create(createPersonalMarketDto, email);
  }

  @Get()
  async findAll(@Body() { homeId }: FindAllDto, @Req() request) {
    const {
      user: { email },
    } = request;

    return this.personalMarketsService.findAll(homeId, email);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() request) {
    const {
      user: { email },
    } = request;

    return this.personalMarketsService.findOne(id, email);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePersonalMarketDto: UpdatePersonalMarketDto,
    @Req() request,
  ) {
    const {
      user: { email },
    } = request;

    return this.personalMarketsService.update(
      id,
      updatePersonalMarketDto,
      email,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() request) {
    const {
      user: { email },
    } = request;
    return this.personalMarketsService.remove(id, email);
  }
}
