import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserEntity } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { sign } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { IUserResponse } from './types/userResponse.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserEntity)
    private userModel: typeof UserEntity,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {    
    const userByLogin = await this.userModel.findOne({
      where: {
        login: createUserDto.login,
      },
    });

    if (userByLogin) {
      throw new HttpException(
        'Login are taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);    
    return await newUser.save();
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userModel.findAll();
  }

  async findOne(id: number): Promise<UserEntity> {
    return this.userModel.findByPk(id);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findOne(id);
    if (updateUserDto.password) {
      // Хешируем пароль вручную при обновлении
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    await user.update(updateUserDto);
    return user;
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await user.destroy();
  }

  async findByLogin(login: string): Promise<UserEntity> {
    return this.userModel.findOne({ where: { login } });
  }

  generateJwt(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        login: user.login,
        password: user.password,
      },
      process.env.JWT_SECRET,
    );
  }

  buildUserResponse(user: UserEntity): IUserResponse {
    const { password, ...userData } = user.toJSON(); // Исключаем password
    return {
      user: {
        ...userData,
        token: this.generateJwt(user),
      },
    };
  }
}
