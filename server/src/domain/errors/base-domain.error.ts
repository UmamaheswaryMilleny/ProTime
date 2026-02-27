export abstract class DomainError extends Error{
  public readonly name : string
  // public readonly message : string
  protected constructor(message:string){
    super(message)
    this.name=new.target.name
    Error.captureStackTrace(this,this.constructor)
  }
}

