import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.entity';
import { UserRegisterDto } from './dto/user.register.dto';
import * as bcrypt from 'bcrypt';
import { ResultDto } from 'src/dto/result.dto';
import { UserUpdateDto } from './dto/user.update.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async list(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async register(
    data: UserRegisterDto,
  ): Promise<{ status: boolean; message: string }> {
    const user = new this.userModel({
      ...data,
      password: bcrypt.hashSync(data.password, 8),
    });

    try {
      await user.save();
      return { status: true, message: 'Usuário cadastrado com sucesso' };
    } catch (error) {
      return {
        status: false,
        message: 'Email já cadastrado',
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
        ...(data.password ? { password: bcrypt.hashSync(data.password, 8) } : {}),
      };

      const user = await this.userModel
        .findOneAndUpdate({ email: data.email }, updateData, { new: true })
        .exec();

      if (!user) {
        return { status: false, message: 'Usuário não encontrado' };
      }

      return { status: true, message: 'Dados atualizados com sucesso' };
    } catch (error) {
      console.error(error);
      return { status: false, message: 'Erro ao atualizar dados' };
    }
  }
}
