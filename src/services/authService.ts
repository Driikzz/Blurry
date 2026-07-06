import { UserDto, UserPostDto } from "../dtos/Users";
import { User } from "../entities/User";

export class AuthService {
  crypto: any;
  jwt: any;

  constructor() {
    this.crypto = require("crypto");
    this.jwt = require("jsonwebtoken");
  }

  hashPassword(password: string) {
    return this.crypto.createHash("sha256").update(password).digest("hex");
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user: User | null = await User.findOneBy({ email: email });

    return user;
  }

  async createUser(userPost: UserPostDto): Promise<UserDto> {
    var hashedPassword = this.hashPassword(userPost.password);

    const newUser = new User();
    Object.assign(newUser, userPost);
    newUser.password = hashedPassword;

    await newUser.save();
    return newUser.toUserDto();
  }

  verifyPassword(password: string, hashedPassword: string): boolean {
    var testedHashedPassword = this.hashPassword(password);

    return testedHashedPassword === hashedPassword;
  }

  createToken(userId: number) {
    let data = {
      time: Date(),
      userId: userId,
    };

    return this.jwt.sign(data, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });
  }
}
