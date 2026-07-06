import { User } from "../entities/User";

export class userService {
  async getAll() {
    const users = await User.find();
    return users;
  }

  async getById(id: number) {
    const user = await User.findOne({ where: { id } });
    return user;
  }

  async create(userData: any) {
    const newUser = new User();
    Object.assign(newUser, userData);
    await newUser.save();
    return newUser;
  }

  async update(id: number, userData: any) {}

  async delete(id: number) {}
}
