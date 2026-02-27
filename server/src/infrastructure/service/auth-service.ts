import {OAuth2Client} from "google-auth-library"
import { injectable } from "tsyringe"
import { IgoogleAuth,SocialUserInfo } from "../../application/service_interface/google-auth.service.interface"
import { config } from "../../shared/config"

@injectable()
export class GoogleAuthService implements IgoogleAuth{
    private readonly client: OAuth2Client

    constructor(){
        this.client=new OAuth2Client(config.google.clientId)
    }

    async verifyToken(idToken: string): Promise<SocialUserInfo> {
        const ticket = await this.client.verifyIdToken({
            idToken,
            audience:config.google.clientId
        })

        const payload = ticket.getPayload();
        if(!payload || !payload.email || !payload.sub){
            throw new Error("Invalid google token")
        }

        return {
            email:payload.email,
            name:payload.name??"",
            picture:payload.picture,
            googleId:payload.sub,
        }

    }
}