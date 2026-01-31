import type { Role } from "./role-types";

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "client";
  bio?: string;
  location?: string;
  profileImage?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}


export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  profileImage?: string;
}

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          


export interface AdminLoginPayload{
    email: string;
  password: string;
}