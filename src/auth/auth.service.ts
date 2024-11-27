import {
  HttpException,
  HttpStatus,
  Injectable,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/token/token.service';
import { User } from 'src/user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => TokenService))
    private tokenService: TokenService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOne(email);
    if (user && bcrypt.compareSync(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    if (!user || !user.email || !user._id) {
      throw new HttpException(
        "O campo 'email' ou 'id' do usuário está indefinido.",
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = { username: user.email, sub: user._id };
    const token = this.jwtService.sign(payload);

    await this.tokenService.save(token, user.email);
    return {
      access_token: token,
    };
  }

  async loginToken(token: string) {
    try {
      const user: User = await this.tokenService.getUserByToken(token);
      if (!user) {
        console.error('Usuário não encontrado para o token:', token);
        throw new HttpException('Token inválido.', HttpStatus.UNAUTHORIZED);
      }
      return this.login(user);
    } catch (error) {
      console.error('Erro ao processar login com token:', error);
      throw new HttpException(
        'Erro ao processar login com token.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
