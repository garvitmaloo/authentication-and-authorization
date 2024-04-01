export const anyOneConditionTrue = (conditionsArray: any[]): boolean =>
  conditionsArray.some(Boolean);

export const allConditionsTrue = (conditionsArray: any[]): boolean =>
  conditionsArray.every(Boolean);
