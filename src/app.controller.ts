import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { AppService } from './app.service';
import { UserDto } from './dto/user.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getUsers(): Promise<any> {
    return this.appService.getUsers();
  }

  @Get(':id')
  getUser(@Param('id') userId: string): Promise<any> {
    return this.appService.getUser(userId);
  }
  @Patch()
  updateUser(@Body() dto: UserDto): Promise<any> {
    return this.appService.updateUser(dto);
  }
}
