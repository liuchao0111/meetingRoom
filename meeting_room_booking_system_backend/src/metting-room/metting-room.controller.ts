import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  Put,
} from '@nestjs/common';
import { MettingRoomService } from './metting-room.service';
import { CreateMettingRoomDto } from './dto/create-metting-room.dto';
import { UpdateMettingRoomDto } from './dto/update-metting-room.dto';
import { generateParseIntPipe } from 'src/utils';

@Controller('metting-room')
export class MettingRoomController {
  constructor(private readonly mettingRoomService: MettingRoomService) {}

  @Get('list')
  async list(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageNo: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(2),
      generateParseIntPipe('pageSize'),
    )
    pageSize: number,
    @Query('name') name: string,

    @Query('capacity') capacity: number,

    @Query('equipment') equipment: string,
  ) {
    return await this.mettingRoomService.find(
      pageNo,
      pageSize,
      name,
      capacity,
      equipment,
    );
  }

  @Post('create')
  create(@Body() createMettingRoomDto: CreateMettingRoomDto) {
    return this.mettingRoomService.create(createMettingRoomDto);
  }

  @Put('update')
  async update(@Body() meetingRoomDto: UpdateMettingRoomDto) {
    return await this.mettingRoomService.update(meetingRoomDto);
  }

  @Get('id')
  async find(@Param('id', generateParseIntPipe('id')) id: number) {
    return await this.mettingRoomService.findById(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mettingRoomService.remove(+id);
  }
}
