export interface IStandardResponse<T> {
  result: T | null;
  error: {
    statusCode: number;
    message: string;
  } | null;
}

export interface ISignupInput {
  fullName: string;
  email: string;
  password?: string;
}

export interface IUser {
  fullName: string;
  email: string;
  emailVerified: boolean;
}

export interface IResource {
  name: string;
  ownerEmail: string;
  type: string;
}
