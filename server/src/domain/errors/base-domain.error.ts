export abstract class DomainError extends Error {
  public readonly name: string
  // public readonly message : string
  protected constructor(message: string) {
    super(message)
    this.name = new.target.name //new.target refers to the class that was actually instantiated.
    //Stack trace shows where the error occurred.
    Error.captureStackTrace(this, this.constructor)
    //this.constructor → UserAlreadyExistsError
    //this mean throw new UserAlreadyExistsError(email)
  }
}

