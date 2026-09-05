import { Injectable } from "@nestjs/common";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

@Injectable()
export class PasswordService {
  async hash(plainTextPassword: string): Promise<string> {
    return bcrypt.hash(plainTextPassword, SALT_ROUNDS);
  }

  async verify(plainTextPassword: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, passwordHash);
  }
}
