import { validate } from "class-validator";
import {
  UserCreateValidator,
  UserDto,
  UserPostDto,
  UserUpdateValidator,
} from "../dtos/Users";
import { User } from "../entities/User";

export class UserService {
  async getAll() {
    const users = await User.find();
    return users.map((user) => user.toUserDto());
  }

  async getById(id: number) {
    const user = await User.findOne({ where: { id } });
    return user?.toUserDto();
  }

  //   async create(userData: UserPostDto) {
  //     const dto = new UserCreateValidator();
  //     dto.name = userData.name;
  //     dto.email = userData.email;
  //     dto.password = userData.password;

  //     const errors = await validate(dto);
  //     if (errors.length > 0) {
  //       return { message: "Validation failed", errors };
  //     }

  //     const user = new User();
  //     Object.assign(user, userData);
  //     await user.save();
  //     return user.toUserDto();
  //   }

  async update(id: number, userData: UserPostDto) {
    const dto = new UserUpdateValidator();
    dto.name = userData.name;
    dto.email = userData.email;
    dto.password = userData.password;

    const errors = await validate(dto);
    if (errors.length > 0) {
      return { message: "Validation failed", errors };
    }

    const user = await User.findOne({ where: { id } });
    if (!user) {
      throw new Error("User not found");
    }
    Object.assign(user, userData);
    await user.save();
    return user.toUserDto();
  }

  async delete(id: number) {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      throw new Error("User not found");
    }
    await user.remove();
    return { message: "User deleted successfully" };
  }
}
