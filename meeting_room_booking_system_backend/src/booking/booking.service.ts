import { RedisService } from './../redis/redis.service';
import { EmailService } from './../email/email.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Between, EntityManager, Like } from 'typeorm';
import { MettingRoom } from 'src/metting-room/entities/metting-room.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class BookingService {
  @InjectEntityManager()
  private entityManager: EntityManager;
  private readonly emailService: EmailService;
  private readonly redisService: RedisService;

  async find(
    pageNo: number,
    pageSize: number,
    username: string,
    mettingRoomName: string,
    mettingRoomPosition: string,
    bookingTimeRangeStart: number,
    bookingTimeRangeEnd: number,
  ) {
    const skipCount = (pageNo - 1) * pageSize;

    const condition: Record<string, any> = {};

    if (username) {
      condition.user = {
        username: Like(`%${username}%`),
      };
    }

    if (mettingRoomName) {
      condition.room = {
        name: Like(`%${mettingRoomName}%`),
      };
    }

    if (mettingRoomPosition) {
      if (!condition.room) {
        condition.room = {};
      }
      condition.room.location = Like(`%${mettingRoomPosition}%`);
    }

    if (bookingTimeRangeStart) {
      if (!bookingTimeRangeEnd) {
        bookingTimeRangeEnd = bookingTimeRangeStart + 60 * 60 * 1000;
      }
      condition.startTime = Between(
        new Date(bookingTimeRangeStart),
        new Date(bookingTimeRangeEnd),
      );
    }

    const [bookings, totalCount] = await this.entityManager.findAndCount(
      Booking,
      {
        where: condition,
        relations: {
          user: true,
          room: true,
        },
        skip: skipCount,
        take: pageSize,
      },
    );
    return {
      list: bookings.map((item) => {
        delete (item.user as any).password;
        return item;
      }),
      totalCount,
    };
  }

  async add(bookingDto: CreateBookingDto, userId: number) {
    const mettingRoom = await this.entityManager.findOneBy(MettingRoom, {
      id: bookingDto.mettingRoomId,
    });

    if (!mettingRoom) {
      throw new BadRequestException('会议室不存在');
    }

    const user = await this.entityManager.findOneBy(User, {
      id: userId,
    });

    const booking = new Booking();
    booking.room = mettingRoom;
    booking.user = user!;
    booking.startTime = new Date(bookingDto.startTime);
    booking.endTime = new Date(bookingDto.endTime);

    const res = await this.entityManager
      .createQueryBuilder(Booking, 'booking')
      .where('booking.roomId = :roomId', { roomId: mettingRoom.id })
      .andWhere('booking.startTime < :endTime', { endTime: booking.endTime })
      .andWhere('booking.endTime > :startTime', {
        startTime: booking.startTime,
      })
      .andWhere('booking.status IN (:...statuses)', {
        statuses: ['pending', 'approved'],
      })
      .getOne();

    if (res) {
      throw new BadRequestException('该会议室已被预定');
    }

    await this.entityManager.save(Booking, booking);
  }

  async apply(id: number) {
    await this.entityManager.update(
      Booking,
      {
        id,
      },
      {
        status: 'approved',
      },
    );
    return 'success';
  }

  async reject(id: number) {
    await this.entityManager.update(
      Booking,
      {
        id,
      },
      {
        status: 'rejected',
      },
    );
    return 'success';
  }

  async unbind(id: number) {
    await this.entityManager.update(
      Booking,
      {
        id,
      },
      {
        status: 'cancelled',
      },
    );
    return 'success';
  }

  async cancel(id: number, userId: number) {
    const booking = await this.entityManager.findOne(Booking, {
      where: { id },
      relations: { user: true },
    });

    if (!booking) {
      throw new BadRequestException('预定不存在');
    }

    if (booking.user.id !== userId) {
      throw new BadRequestException('只能取消自己的预定');
    }

    if (booking.status !== 'pending') {
      throw new BadRequestException('只能取消待审批的预定');
    }

    await this.entityManager.update(Booking, { id }, { status: 'cancelled' });
    return 'success';
  }

  async urge(id: number) {
    const flag = await this.redisService.get(`urge_` + id);

    if (flag) {
      return '半个小时只能催办一次，请耐心等待';
    }

    let email = await this.redisService.get('admin_email');

    if (!email) {
      const admin = await this.entityManager.findOne(User, {
        select: {
          email: true,
        },
        where: {
          isAdmin: true,
        },
      });
      email = admin!.email!;
      await this.redisService.set('admin_email', admin!.email);
    }
    await this.emailService.sendMail({
      to: email,
      subject: '预定申请催办提醒',
      html: `id 为 ${id} 的预定申请正在等待审批`,
    });

    await this.redisService.set('urge_' + id, 1, 60 * 30);
  }
}
