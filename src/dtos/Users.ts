import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";

export interface UserDto {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPostDto {
  name: string;
  email: string;
  password: string;
}

export interface UserLoginDto {
  email: string;
  password: string;
}

// Class validator

export class UserCreateValidator {
  @IsNotEmpty()
  @MaxLength(30)
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;
}

export class UserUpdateValidator {
  @MaxLength(30)
  name!: string;

  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;
}

export class UserLoginValidator {
  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;
}
