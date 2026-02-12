import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  DefaultValuePipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RequireLogin, UserInfo } from 'src/custom.decorator';
import { UpdateUserPasswordDto } from './dto/update-user-password.dot';
import { UpdateUserDto } from './dto/update-user.dto';
import { generateParseIntPipe, storage } from 'src/utils';
import { FileInterceptor } from '@nestjs/platform-express';
import path from 'path';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //注册用户
  @Post('register')
  register(@Body() registerUser: RegisterUserDto) {
    return this.userService.register(registerUser);
  }

  //获取验证码（统一接口）
  @Get('captcha')
  async captcha(
    @Query('address') address: string,
    @Query('type') type: 'register' | 'update_password' | 'update_user',
  ) {
    return this.userService.sendCaptcha(address, type);
  }

  //登录
  @Post(['login', 'admin/login'])
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Query('isAdmin') isAdmin: string,
  ) {
    return this.userService.login(loginUserDto, isAdmin === 'true');
  }

  //更新用户密码（需要登录）
  @Post(['update_password', 'admin/update_password'])
  @RequireLogin()
  async updatePassword(
    @UserInfo('userId') userId: number,
    @Body() passwordDto: UpdateUserPasswordDto,
  ) {
    return await this.userService.updatePassword(userId, passwordDto);
  }

  //忘记密码（不需要登录，通过邮箱验证）
  @Post('reset_password')
  async resetPassword(@Body() passwordDto: UpdateUserPasswordDto) {
    return await this.userService.resetPasswordByEmail(passwordDto);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads',
      limits: {
        fileSize: 1024 * 1024 * 3,
      },
      storage: storage,
      fileFilter(req, file, callback) {
        const extname = path.extname(file.originalname);
        if (['.png', '.jpg', '.jpeg', '.gif'].includes(extname)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('只允许上传图片'), false);
        }
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file, 'file');
    return file.path;
  }

  //刷新 token
  @Get(['refresh', 'admin/refresh'])
  async refresh(
    @Query('refreshToken') refreshToken: string,
    @Query('isAdmin') isAdmin: string,
  ) {
    return this.userService.refresh(refreshToken, isAdmin === 'true');
  }

  //获取用户信息
  @Get('userInfo')
  @RequireLogin()
  async info(@UserInfo('userId') userId: number) {
    return await this.userService.findUserDetailById(userId);
  }

  //更新用户信息
  @Post(['update', 'admin/update'])
  @RequireLogin()
  async updateUserInfo(
    @UserInfo('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(userId, updateUserDto);
  }

  //冻结用户
  @Get('freeze')
  async freeze(@Query('id') userId: number) {
    await this.userService.freeUserById(userId);
    return 'success';
  }

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
    @Query('username') username: string,
    @Query('nickname') nickname: string,
    @Query('email') email: string,
  ) {
    return await this.userService.findUsersByPage(
      pageNo,
      pageSize,
      username,
      nickname,
      email,
    );
  }
}
