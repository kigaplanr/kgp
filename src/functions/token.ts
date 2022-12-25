import crypto from "crypto";

export class Token {
  static generateToken() {
    return crypto.randomBytes(18).toString("hex");
  }
}
