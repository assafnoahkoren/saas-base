import { IsEmail, IsString, IsBoolean, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Password is required' })
  password: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
