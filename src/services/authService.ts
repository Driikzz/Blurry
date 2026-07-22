import crypto from "crypto";
import jwt from "jsonwebtoken";
import { UserDto, UserPostDto } from "../dtos/Users";
import { User } from "../entities/User";

export class AuthService {
  hashPassword(password: string) {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user: User | null = await User.findOneBy({ email: email });

    return user;
  }

  async createUser(userPost: UserPostDto): Promise<UserDto> {
    const hashedPassword = this.hashPassword(userPost.password);

    const newUser = new User();
    Object.assign(newUser, userPost);
    newUser.password = hashedPassword;

    await newUser.save();
    return newUser.toUserDto();
  }

  verifyPassword(password: string, hashedPassword: string): boolean {
    const testedHashedPassword = this.hashPassword(password);

    return testedHashedPassword === hashedPassword;
  }

  createToken(userId: number) {
    const data = {
      time: Date(),
      userId: userId,
    };

    return jwt.sign(data, process.env.JWT_SECRET_KEY!, {
      expiresIn: "1d",
    });
  }
}
