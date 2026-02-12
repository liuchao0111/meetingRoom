import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMettingRoomDto } from './dto/create-metting-room.dto';
import { UpdateMettingRoomDto } from './dto/update-metting-room.dto';
import { MettingRoom } from './entities/metting-room.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class MettingRoomService {
  constructor(
    @InjectRepository(MettingRoom)
    private readonly MettingRepository: Repository<MettingRoom>,
  ) {}
  async initData() {
    const room1 = new MettingRoom();
    room1.name = '木星';
    room1.capacity = 10;
    room1.equipment = '白板';
    room1.location = '一层西';

    const room2 = new MettingRoom();
    room2.name = '金星';
    room2.capacity = 5;
    room2.equipment = '';
    room2.location = '二层东';

    const room3 = new MettingRoom();
    room3.name = '天王星';
    room3.capacity = 30;
    room3.equipment = '白板，电视';
    room3.location = '三层东';

    await this.MettingRepository.save([room1, room2, room3]);
  }

  async find(
    pageNo: number,
    pageSize: number,
    name: string,
    capacity: number,
    equipment: string,
  ) {
    if (pageNo < 1) {
      throw new BadRequestException('页码最小为1');
    }
    const condition: Record<string, any> = {};

    const skipCount = (pageNo - 1) * pageSize;
    if (name) {
      condition.name = Like(`%${name}%`);
    }
    if (capacity) {
      condition.capacity = Like(`%${capacity}%`);
    }

    if (equipment) {
      condition.equipment = Like(`%${equipment}%`);
    }

    const [mettingRooms, totalCount] =
      await this.MettingRepository.findAndCount({
        skip: skipCount,
        take: pageSize,
        where: condition,
      });

    return {
      mettingRooms,
      totalCount,
    };
  }

  async create(createMettingRoomDto: CreateMettingRoomDto) {
    const room = await this.MettingRepository.findOneBy({
      name: createMettingRoomDto.name,
    });

    if (room) {
      throw new BadRequestException('会议室名字已存在');
    }
    return await this.MettingRepository.save(createMettingRoomDto);
  }

  findAll() {
    return `This action returns all mettingRoom`;
  }

  async findById(id: number) {
    return this.MettingRepository.findOneBy({ id });
  }

  async update(updateMettingRoomDto: UpdateMettingRoomDto) {
    const mettingRoom = await this.MettingRepository.findOneBy({
      id: updateMettingRoomDto.id,
    });
    if (!mettingRoom) {
      throw new BadRequestException('会议室不存在');
    }
    mettingRoom.capacity = updateMettingRoomDto.capacity!;
    mettingRoom.location = updateMettingRoomDto.location!;
    mettingRoom.name = updateMettingRoomDto.name!;
    if (mettingRoom.description) {
      mettingRoom.description = updateMettingRoomDto.description!;
    }
    if (mettingRoom.equipment) {
      mettingRoom.equipment = updateMettingRoomDto.equipment!;
    }
    return await this.MettingRepository.update(
      {
        id: updateMettingRoomDto.id,
      },
      updateMettingRoomDto,
    );
  }

  async remove(id: number) {
    const mettingRoom = await this.MettingRepository.findOneBy({
      id,
    });
    if (mettingRoom) {
      return await this.MettingRepository.delete({ id });
    }
  }
}
