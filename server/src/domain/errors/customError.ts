export class CustomError extends Error{
    constructor(public statusCode : number, message : string){
        super(message);
        // new.target means: “Which class was ACTUALLY used with the new keyword?”
        this.name = new.target.name;
        // Removes unnecessary constructor details from the stack trace
        Error.captureStackTrace(this, this.constructor)
    }
}