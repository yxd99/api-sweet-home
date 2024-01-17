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
    @Req() { user: { email } },
  ) {
    
    return await this.personalMarketsService.create(
      createPersonalMarketDto,
      email,
    );
  }

  @Get()
  async findAll(@Query('home_id') home_id, @Req() { user: { email } }) {
    

    return await this.personalMarketsService.findAll(+home_id || null, email);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() { user: { email } }) {
    

    return this.personalMarketsService.findOne(+id, email);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePersonalMarketDto: UpdatePersonalMarketDto,
    @Req() { user: { email } },
  ) {
    

    return this.personalMarketsService.update(
      +id,
      updatePersonalMarketDto,
      email,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() { user: { email } }) {
    
    return this.personalMarketsService.remove(+id, email);
  }
}
