import bcrypt from "bcrypt";

export const hashPassword = (password: string): Promise<string> => {
  const saltround = 10;
  const data = bcrypt.hash(password, saltround);
  return data;
};

export const comparePassword =  (
  password: string,
  userPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, userPassword);
};