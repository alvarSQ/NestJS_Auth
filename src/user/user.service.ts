// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserEntity } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserEntity)
    private userModel: typeof UserEntity,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    // Хеширование происходит в модели через @BeforeCreate
    return this.userModel.create(createUserDto);
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
}
