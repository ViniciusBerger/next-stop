import { IAuthStrategy } from "./auth-strategy.interface";
import { RegisterUserDTO } from "../DTOs/register.user.DTO";
import { User } from "src/user/schemas/user.schema";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import admin from 'firebase-admin'
import { UserService } from "../../../user/service/user.service";
import { CreateUserDTO } from "../../../user/DTOs/create.user.DTO";
import { GetUserDTO } from "../../../user/DTOs/get.user.DTO";
import { ValidateUserDTO } from "../DTOs/validate.user.DTO";


/**
 * Concrete strategy class, it implements IAuthStrategy
 * which is the contract to be followed by any auth method in this application
 * 
 * EmailStrategy is meant to auth with email and password
 */
@Injectable()
export class EmailStrategy implements IAuthStrategy {
    provider: string;

    // inject firebase admin
    constructor(
        @Inject('FIREBASE_ADMIN') private readonly firebase: admin.app.App,
        private readonly userService: UserService,
    ){}

    // validate user
    async validate(credentials: ValidateUserDTO): Promise<User| null> {
        const userClaims = await this.firebase.auth().verifyIdToken(credentials.token);

        if (!userClaims) throw new BadRequestException("user is not registered! Please register before login")

        const user = await this.userService.getUser(new GetUserDTO(userClaims.uid))
        
        return user
    }


    // should register user and return user Object
    async register(credentials: RegisterUserDTO): Promise<User | null> {
        const firebaseUser = await this.firebase.auth().createUser({email: credentials.email, password: credentials.password, displayName: credentials.displayName})

        const createUserDTO: CreateUserDTO = {...credentials, "firebaseUid": firebaseUser.uid, role: "member"} 
        const newUser = await this.userService.createUser(createUserDTO)

        return newUser
    }


}