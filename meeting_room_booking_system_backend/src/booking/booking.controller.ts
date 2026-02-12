import {
  Controller,
  Get,
  Body,
  Param,
  Query,
  DefaultValuePipe,
  Post,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { generateParseIntPipe } from 'src/utils';
import { RequireLogin, UserInfo } from 'src/custom.decorator';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('list')
  async list(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageNo: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(10),
      generateParseIntPipe('pageSize'),
    )
    pageSize: number,
    @Query('username') username: string,
    @Query('mettingRoomName') mettingRoomName: string,
    @Query('mettingRoomPosition') meetingRoomPosition: string,
    @Query('bookingTimeRangeStart') bookingTimeRangeStart: number,
    @Query('bookingTimeRangeEnd') bookingTimeRangeEnd: number,
  ) {
    return this.bookingService.find(
      pageNo,
      pageSize,
      username,
      mettingRoomName,
      meetingRoomPosition,
      bookingTimeRangeStart,
      bookingTimeRangeEnd,
    );
  }

  @Post('add')
  @RequireLogin()
  async add(
    @Body() booking: CreateBookingDto,
    @UserInfo('userId') userId: number,
  ) {
    return await this.bookingService.add(booking, userId);
  }

  @Get('apply/:id')
  async apply(@Param('id') id: string) {
    return await this.bookingService.apply(+id);
  }
  @Get('reject/:id')
  async reject(@Param('id') id: string) {
    return await this.bookingService.reject(+id);
  }
  @Get('unibind/:id')
  async unbind(@Param('id') id: string) {
    return await this.bookingService.unbind(+id);
  }

  @Get('cancel/:id')
  @RequireLogin()
  async cancel(@Param('id') id: string, @UserInfo('userId') userId: number) {
    return await this.bookingService.cancel(+id, userId);
  }

  @Get('urge/:id')
  async urge(@Param('id') id: number) {
    return await this.bookingService.urge(id);
  }
}
