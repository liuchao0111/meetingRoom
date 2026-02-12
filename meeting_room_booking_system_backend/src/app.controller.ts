import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { RequireLogin, RequirePermission } from './custom.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }

  @Get('aaa')
  @RequireLogin()
  @RequirePermission('ddd')
  aaaa() {
    return 'aaa';
  }

  @Get('bbb')
  // @SetMetadata('require-permission', ['ccc'])
  bbb() {
    return 'bbb';
  }
}
