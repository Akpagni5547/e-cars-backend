import { Body, Controller, Get, Post } from '@nestjs/common';
import { LoginCredentialsDto } from './dto/login.dto';
import { UserSubscribeDto } from './dto/subscribe.dto';
import { UserEntity } from '../../entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Post()
  register(@Body() userData: UserSubscribeDto) {
    return this.userService.register(userData);
  }

  @Post('login')
  login(@Body() credentials: LoginCredentialsDto) {
    return this.userService.login(credentials);
  }

  @Get('')
  findAll(): Promise<UserEntity[]> {
    return this.userService.findAll();
  }
}
