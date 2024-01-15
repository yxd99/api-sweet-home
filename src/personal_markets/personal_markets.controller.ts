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
import { PersonalMarketsService } from './personal_markets.service';
import { CreatePersonalMarketDto } from './dto/create-personal_market.dto';
import { UpdatePersonalMarketDto } from './dto/update-personal_market.dto';

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
  async findAll(@Query('home_id') home_id, @Req() request) {
    const {
      user: { email },
    } = request;

    return await this.personalMarketsService.findAll(+home_id || null, email);
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
  remove(@Param('id') id: string, @Req() request) {
    const {
      user: { email },
    } = request;
    return this.personalMarketsService.remove(+id, email);
  }
}
