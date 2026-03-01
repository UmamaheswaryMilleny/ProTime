import { DomainError } from "./base-domain.error";


export class ProfileNotFoundError extends DomainError{
    constructor(){
        super(`User profile not found`)
    }
}
