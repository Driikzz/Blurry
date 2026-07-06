import { UserDto } from "./Users";

export interface GameDto {
  id: number;
  name: string;
  users: UserDto[];
}
