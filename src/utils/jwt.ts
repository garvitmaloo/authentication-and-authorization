import jwt from "jsonwebtoken";

export const generateJwtToken = (payload: object): string => {
  const token = jwt.sign(payload, process.env.JWT_SECRET!);
  return token;
};
