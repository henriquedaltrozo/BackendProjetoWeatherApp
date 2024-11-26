import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.entity';
import { UserRegisterDto } from './dto/user.register.dto';
import * as bcrypt from 'bcrypt';
import { ResultDto } from 'src/dto/result.dto';
import { UserUpdateDto } from './dto/user.update.dto';
//a
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async list(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async register(
    data: UserRegisterDto,
  ): Promise<{ status: boolean; mensagem: string }> {
    const user = new this.userModel({
      ...data,
      password: bcrypt.hashSync(data.senha, 8),
    });

    try {
      await user.save();
      return { status: true, mensagem: 'Usuário cadastrado com sucesso' };
    } catch (error) {
      return {
        status: false,
        mensagem: 'Houve um erro ao cadastrar o usuário',
      };
    }
  }

  async findOne(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(data: UserUpdateDto): Promise<ResultDto> {
    try {
      const updateData = {
        ...data,
        ...(data.senha ? { password: bcrypt.hashSync(data.senha, 8) } : {}),
      };

      const user = await this.userModel
        .findOneAndUpdate({ email: data.email }, updateData, { new: true })
        .exec();

      if (!user) {
        return { status: false, mensagem: 'Usuário não encontrado' };
      }

      return { status: true, mensagem: 'Dados atualizados com sucesso' };
    } catch (error) {
      console.error(error);
      return { status: false, mensagem: 'Erro ao atualizar dados' };
    }
  }
}
