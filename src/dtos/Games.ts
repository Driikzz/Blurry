import { UserDto } from "./Users";

export interface GameDto {
  id: number;
  name: string;
  user: UserDto[];
}
