import { UserDto } from "../dtos/Users";
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

  async create(userData: UserDto) {
    const newUser = new User();
    Object.assign(newUser, userData);
    await newUser.save();
    return newUser.toUserDto();
  }

  async update(id: number, userData: UserDto) {
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
