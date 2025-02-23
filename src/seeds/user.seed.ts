// src/database/seeds/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { UserService } from '@/user/user.service';
import { CreateUserDto } from '@/user/dto/create-user.dto';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  const users: CreateUserDto[] =  [
      {
        login: 'Иванков И.И.',
        tabel: '009',
        password: '123',
      },
      {
        login: 'Петров И.И.',
        tabel: '002',
        password: '123',
      },
      {
        login: 'Сидоров И.И.',
        tabel: '003',
        password: '123',
      },
      {
        login: 'Новиков И.И.',
        tabel: '004',
        password: '123',
      },
      {
        login: 'Иванова И.И.',
        tabel: '005',
        password: '123',
      },
      {
        login: 'Петрова И.И.',
        tabel: '006',
        password: '123',
      },
      {
        login: 'Сидорова И.И.',
        tabel: '007',
        password: '123',
      },
      {
        login: 'Новикова И.И.',
        tabel: '008',
        password: '123',
      },
    ];

  try {
    for (const userDto of users) {
      await userService.createUser(userDto);
      console.log(`Created user: ${userDto.login}`);
    }
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();

