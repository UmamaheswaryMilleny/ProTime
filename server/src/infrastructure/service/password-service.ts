import bcrypt from 'bcrypt'
import { injectable } from 'tsyringe'
import { IPasswordHasherService } from '../../application/service_interface/password-hasher.service.interface'
import { config } from '../../shared/config'


@injectable()
export class PasswordHasherService implements IPasswordHasherService{
    private readonly saltRounds:number;
    constructor(){
        this.saltRounds=config.bcrypt.saltRounds
    }

    async hash(password:string):Promise<string>{
        return bcrypt.hash(password,this.saltRounds)
    }
    async compare(password:string,hash:string):Promise<boolean>{
        return bcrypt.compare(password,hash)
    }
}