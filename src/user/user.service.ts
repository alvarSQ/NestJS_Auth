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

  // async findAll(): Promise<UserEntity[]> {
  //   return this.userModel.findAll();
  // }

  // async findOne(id: number): Promise<UserEntity> {
  //   return this.userModel.findByPk(id);
  // }

  // async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
  //   const user = await this.findOne(id);
  //   if (updateUserDto.password) {
  //     // Хешируем пароль вручную при обновлении
  //     updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
  //   }
  //   await user.update(updateUserDto);
  //   return user;
  // }

  // async remove(id: number): Promise<void> {
  //   const user = await this.findOne(id);
  //   await user.destroy();
  // }

  // async findByLogin(login: string): Promise<UserEntity> {
  //   return this.userModel.findOne({ where: { login } });
  // }

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
