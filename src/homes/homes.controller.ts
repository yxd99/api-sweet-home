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
import { HomesService } from './homes.service';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';

@Controller('homes')
export class HomesController {
  constructor(private readonly homesService: HomesService) {}

  @Post()
  async create(@Body() createHomeDto: CreateHomeDto, @Req() request) {
    const {
      user: { email },
    } = request;

    console.log(email);

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
  findOne(@Param('id') id: string, @Req() request) {
    const {
      user: { email },
    } = request;
    return this.homesService.findOne(+id, email);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHomeDto: UpdateHomeDto) {
    return this.homesService.update(+id, updateHomeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.homesService.remove(+id);
  }
}
