import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MettingRoomService } from './metting-room.service';
import { MettingRoomController } from './metting-room.controller';
import { MettingRoom } from './entities/metting-room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MettingRoom])],
  controllers: [MettingRoomController],
  providers: [MettingRoomService],
})
export class MettingRoomModule {}
