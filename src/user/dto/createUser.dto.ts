import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  readonly login: string;

  @IsNotEmpty()
  readonly tabel: string;
  
  @IsNotEmpty()
  readonly password: string;
}
