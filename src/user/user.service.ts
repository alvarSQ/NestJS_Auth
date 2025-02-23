import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserEntity } from './user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';
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

    const userByTabel = await this.userModel.findOne({
      where: {
        tabel: createUserDto.tabel,
      },
    });

    if (userByLogin || userByTabel) {
      throw new HttpException(
        'Login or Tabel are taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    return await newUser.save();
  }

  async login(loginUserDto: CreateUserDto): Promise<UserEntity> {
    const userByLogin = await this.userModel.findOne({
      where: {
        login: loginUserDto.login,
      },
    });

    const userByTabel = await this.userModel.findOne({
      where: {
        tabel: loginUserDto.tabel,
      },
    });
    if (!userByLogin || !userByTabel) {
      throw new HttpException(
        'Credentials are not valid',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isPasswordCorrect = await compare(
      loginUserDto.password,
      userByLogin.password,
    );
    if (!isPasswordCorrect) {
      throw new HttpException(
        'Credentials are not valid',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return userByLogin;
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Фильтруем только разрешенные поля
    const allowedFields: Partial<UpdateUserDto> = {
      login: updateUserDto.login,
      tabel: updateUserDto.tabel,
    };

    // Обновляем только разрешенные поля
    Object.assign(user, allowedFields);
    return await user.save();
  }

  async deleteUser(userId: number): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    await user.destroy();
  }

  async findById(id: number): Promise<UserEntity> {
    return this.userModel.findOne({
      where: { id },
    });
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
