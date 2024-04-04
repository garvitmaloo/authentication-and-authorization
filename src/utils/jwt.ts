import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

export const generateJwtToken = (payload: object): string => {
  const token = jwt.sign(payload, process.env.JWT_SECRET!);
  return token;
};

export const verifyJwtToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  return decoded;
};
