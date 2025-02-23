export class UpdateUserDto {
  readonly login?: string;
  readonly tabel?: string;
  readonly password?: string; // Новый пароль
  readonly currentPassword?: string; // Текущий пароль
}
