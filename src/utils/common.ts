import crypto from "crypto";

export const anyOneConditionTrue = (conditionsArray: any[]): boolean =>
  conditionsArray.some(Boolean);

export const allConditionsTrue = (conditionsArray: any[]): boolean =>
  conditionsArray.every(Boolean);

export const generateUniqueNumber = (digits: number): string => {
  let code = "";

  for (let i = 0; i < digits; i++) {
    const randomNumber = crypto.randomInt(0, 9);
    code += randomNumber.toString();
  }

  return code;
};
