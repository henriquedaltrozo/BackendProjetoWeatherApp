
import { Injectable, Inject, HttpException, HttpStatus, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token } from './token.entity';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/user/user.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<Token>,
    private userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  async save(hash: string, username: string) {
    if (!username) {
      console.error("Erro: O campo 'username' está indefinido.");
      throw new Error("O campo 'username' é obrigatório para salvar o token.");
    }

    console.log("Salvando token:", hash, "para o usuário:", username);

    let objToken = await this.tokenModel.findOne({ username });
    if (objToken) {
      objToken.hash = hash;
      await objToken.save();
    } else {
      await this.tokenModel.create({ hash, username });
    }
  }

  async refreshToken(oldToken: string) {
    const objToken = await this.tokenModel.findOne({ hash: oldToken });
    if (objToken) {
      const user = await this.userService.findOne(objToken.username);
      return this.authService.login(user);
    } else {
      throw new HttpException(
        { errorMessage: 'Token inválido' },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async getUserByToken(token: string): Promise<User> {
    const tokenHash = token.replace("Bearer ", "").trim();
    const objToken = await this.tokenModel.findOne({ hash: tokenHash });
    if (objToken) {
      return this.userService.findOne(objToken.username);
    } else {
      return null;
    }
  }
}
