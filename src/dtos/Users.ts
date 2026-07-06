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
