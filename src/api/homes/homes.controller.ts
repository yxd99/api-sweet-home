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

import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { HomesService } from './homes.service';

@Controller('homes')
export class HomesController {
  constructor(private readonly homesService: HomesService) {}

  @Post()
  async create(@Body() createHomeDto: CreateHomeDto, @Req() request) {
    const {
      user: { email },
    } = request;

    return this.homesService.create(createHomeDto, email);
  }

  @Get()
  findAll(@Req() request) {
    const {
      user: { email },
    } = request;
    return this.homesService.findAll(email);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() request) {
    const {
      user: { email },
    } = request;

    return this.homesService.getHouseInfo(id, email);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHomeDto: UpdateHomeDto,
    @Req() request,
  ) {
    const {
      user: { email },
    } = request;
    return this.homesService.update(id, updateHomeDto, email);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() request) {
    const {
      user: { email },
    } = request;
    return this.homesService.remove(id, email);
  }
}
