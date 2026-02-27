import { DomainError } from "./base-domain.error.js";


export class UserAlreadyExistsError extends DomainError{
    constructor(email:string){
        super(`User with email ${email} already exists`)
    }
}

export class UserNotFoundError extends DomainError{
    constructor(){
        super(`User not found`)
    }
}

export class UserBlockedError extends DomainError{
    constructor(){
        super(`User is blocked by admin`)
    }
}

export class PasswordMismatchError extends DomainError{
    constructor(){
        super(`Password and confirm password do not match`)
    }
}

export class InvalidPasswordError extends DomainError{
    constructor(){
        super(`Invalid email or password`)
    }
}

export class WeakPasswordError extends DomainError{
    constructor(){
        super(`Password does not meet security requirements`)
    }
}


export class InvalidOtpError extends DomainError{
    constructor(){
        super(`Invalid or expired OTP`)
    }
}

export class InvalidTokenError extends DomainError{
    constructor(){
        super(`Invalid or expired token`)
    }
}
export class UserDeletedError extends DomainError{
    constructor(){
        super(`User deleted account`)
    }
}



export class RegistrationSessionExpiredError extends DomainError {
  constructor() {
    super("Registration session expired. Please register again.");
  }
}