import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { ResultDto } from 'src/dto/result.dto';
import { UserRegisterDto } from './dto/user.register.dto';
import { UserUpdateDto } from './dto/user.update.dto';
import { User } from './user.entity';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private authService: AuthService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async list(): Promise<User[]> {
    return this.userService.list();
  }

  @Post('register')
  async register(@Body() data: UserRegisterDto): Promise<ResultDto> {
    return this.userService.register(data);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('login-token')
  async loginToken(@Body() data: { token: string }) {
    if (!data || !data.token) {
      throw new HttpException('Token não fornecido.', HttpStatus.BAD_REQUEST);
    }
    return this.authService.loginToken(data.token);
  }

  @Put('update')
  async update(@Body() data: UserUpdateDto): Promise<ResultDto> {
    return this.userService.update(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('data')
  async getUserData(@Request() req) {
    const email = req.user?.username;
    if (!email) {
      throw new HttpException(
        'Email não encontrado no token.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.userService.findOne(email);
    if (!user) {
      throw new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND);
    }

    return user;
  }
}
