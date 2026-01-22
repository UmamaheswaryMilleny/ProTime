/**
 * Base login request interface
 * All role-specific login DTOs must satisfy this interface
 * This ensures type safety while allowing role-specific validation rules
 */
export interface BaseLoginRequest {
  email: string;
  password: string;
}
