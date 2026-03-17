

export interface IRegisterUsecase{
   execute(data: {fullName:string, email: string; password: string }): Promise<void>;

}

