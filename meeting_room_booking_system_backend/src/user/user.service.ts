import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RedisService } from './../redis/redis.service';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { md5 } from 'src/utils';
import { Permission } from './entities/permission.entity';
import { LoginUserVo } from './vo/login-user.vo';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserDetailVo } from './vo/user-info.vo';
import { UpdateUserPasswordDto } from './dto/update-user-password.dot';
import { EmailService } from '../email/email.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}
  private logger = new Logger();

  async register(user: RegisterUserDto) {
    const captcha = await this.redisService.get(`captcha_${user.email}`);

    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }
    if (user.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOne({
      where: {
        username: user.username,
      },
    });

    if (foundUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }
    const newUser = new User();
    newUser.username = user.username;
    newUser.password = md5(user.password);
    newUser.email = user.email;
    newUser.nickname = user.nickName;
    try {
      await this.userRepository.save(newUser);
      return '注册成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '注册失败';
    }
  }

  async login(loginUserDto: LoginUserDto, isAdmin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUserDto.username,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    if (user.password !== md5(loginUserDto.password)) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }

    const vo = new LoginUserVo();
    vo.userInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      phoneNumber: user.phoneNumber,
      headPic: user.headPic,
      createTime: user.createTime,
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      permissions: Array.from(
        user.roles
          .flatMap((role) => role.permissions)
          .reduce((map, permission) => {
            map.set(permission.id, permission);
            return map;
          }, new Map<number, Permission>())
          .values(),
      ),
    };

    // 生成 token
    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );

    vo.refreshToken = this.jwtService.sign(
      { userId: vo.userInfo.id },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expres_time') || '7d',
      },
    );

    return vo;
  }

  // 刷新 token
  async refresh(refreshToken: string, isAdmin: boolean) {
    try {
      const data = this.jwtService.verify(refreshToken);
      const user = await this.findUserById(data.userId as number, isAdmin);

      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          roles: user.roles,
          permissions: user.permissions,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );

      const refresh_token = this.jwtService.sign(
        {
          userId: user.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expres_time') || '7d',
        },
      );

      return {
        access_token,
        refresh_token,
      };
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'token 已失效，请重新登录',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // 根据 userId 查找用户信息（私有方法） 用来生成token 的用户信息
  private async findUserById(userId: number, isAdmin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });

    return {
      id: user!.id,
      username: user!.username,
      isAdmin: user!.isAdmin,
      roles: user!.roles.map((item) => item.name),
      permissions: Array.from(
        user!.roles
          .flatMap((role) => role.permissions)
          .reduce((map, permission) => {
            map.set(permission.id, permission); // id 作为 key，自动去重
            return map;
          }, new Map<number, Permission>())
          .values(),
      ),
    };
  }

  //根据 id 查询用户信息
  async findUserDetailById(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    const vo = new UserDetailVo();
    vo.id = user!.id;
    vo.email = user!.email;
    vo.username = user!.username;
    vo.headPic = user!.headPic;
    vo.phoneNumber = user!.phoneNumber;
    vo.nickname = user!.nickname;
    vo.createTime = user!.createTime;
    vo.isFrozen = user!.isFrozen;
    vo.isAdmin = user!.isAdmin;

    return vo;
  }

  //更新密码（已登录用户）
  async updatePassword(userId: number, passwordDto: UpdateUserPasswordDto) {
    const captcha = await this.redisService.get(
      `update_password_captcha_${passwordDto.email}`,
    );

    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }
    if (passwordDto.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    foundUser!.password = md5(passwordDto.password);
    try {
      await this.userRepository.save(foundUser!);
      return '修改成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '修改失败';
    }
  }

  //重置密码（忘记密码，通过邮箱验证）
  async resetPasswordByEmail(passwordDto: UpdateUserPasswordDto) {
    const captcha = await this.redisService.get(
      `update_password_captcha_${passwordDto.email}`,
    );

    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }
    if (passwordDto.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOne({
      where: {
        email: passwordDto.email,
      },
    });

    if (!foundUser) {
      throw new HttpException('该邮箱未注册', HttpStatus.BAD_REQUEST);
    }

    foundUser.password = md5(passwordDto.password);
    try {
      await this.userRepository.save(foundUser);
      return '密码重置成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '密码重置失败';
    }
  }

  //更新用户信息
  async update(userId: number, updateUserDto: UpdateUserDto) {
    const captcha = await this.redisService.get(
      `update_user_captcha_${updateUserDto.email}`,
    );
    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }
    if (updateUserDto.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (foundUser && updateUserDto.nickname) {
      foundUser.nickname = updateUserDto.nickname;
    }
    if (foundUser && updateUserDto.headPic) {
      foundUser.headPic = updateUserDto.headPic;
    }

    try {
      await this.userRepository.save(foundUser!);
      return '更新成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '更新失败';
    }
  }

  //发送验证码（统一方法）
  async sendCaptcha(
    address: string,
    type: 'register' | 'update_password' | 'update_user',
  ) {
    const code = Math.random().toString().slice(2, 8);

    const captchaConfig = {
      register: {
        key: `captcha_${address}`,
        ttl: 5 * 60,
        subject: '注册验证码',
        html: `<h2>欢迎注册会议室预约系统</h2><p>您的验证码为: ${code}</p>`,
      },
      update_password: {
        key: `update_password_captcha_${address}`,
        ttl: 10 * 60,
        subject: '修改密码验证码',
        html: `<h2>修改密码验证码</h2><p>您的验证码为: ${code}</p>`,
      },
      update_user: {
        key: `update_user_captcha_${address}`,
        ttl: 10 * 60,
        subject: '更改用户信息验证码',
        html: `<p>您的验证码为: ${code}</p>`,
      },
    };

    const config = captchaConfig[type];
    await this.redisService.set(config.key, code, config.ttl);
    await this.emailService.sendMail({
      to: address,
      subject: config.subject,
      html: config.html,
    });

    return '发送成功';
  }

  async freeUserById(id: number) {
    const user = await this.userRepository.findOneBy({
      id,
    });

    if (user) {
      user.isFrozen = true;
      await this.userRepository.save(user);
    }
  }

  //根据传入的pageNo 和 pageNumber来检查跳页码数
  async findUsersByPage(
    pageNo: number,
    pageSize: number,
    username: string,
    nickname: string,
    email: string,
  ) {
    const skipCount = (pageNo - 1) * pageSize;

    const condition: Record<string, any> = {};

    if (username) {
      condition.username = Like(`%${username}%`);
    }
    if (nickname) {
      condition.nickname = Like(`%${nickname}%`);
    }
    if (email) {
      condition.email = Like(`%${email}%`);
    }

    const [users, totalCount] = await this.userRepository.findAndCount({
      select: [
        'id',
        'username',
        'nickname',
        'email',
        'phoneNumber',
        'isFrozen',
        'headPic',
        'createTime',
      ],
      skip: skipCount,
      take: pageSize,
      where: condition,
    });

    return {
      users,
      totalCount,
    };
  }
}
