import { IAuthStrategy } from "./auth-strategy.interface";
import { RegisterUserDTO } from "../DTOs/register.user.DTO";
import { User } from "../../user/user.schema";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import admin from 'firebase-admin'
import { UserService } from "../../user/service/user.service";
import { CreateUserDTO } from "../../user/DTOs/create.user.DTO";
import { GetUserDTO } from "../../user/DTOs/get.user.DTO";
import { ValidateUserDTO } from "../DTOs/validate.user.DTO";

/**
 * EmailStrategy
 * 
 * Concrete authentication strategy implementing IAuthStrategy.
 *
 * Handles email/password authentication using Firebase Admin
 * and synchronizes authenticated users with the local MongoDB database.
 *
 * - Validate users by verifying Firebase ID tokens
 * - Register new users in Firebase Authentication
 * - Create corresponding user records in the application database
 * - Return User entities for successful authentication flows
 *
 * Part of the Strategy + Factory authentication architecture, allowing
 * provider-specific logic to remain isolated from core services.
 * 
 * @author Vinicius Berger
 */


@Injectable()
export class AuthStrategy implements IAuthStrategy {
    provider: string;

    // inject firebase admin
    constructor(
        @Inject('FIREBASE_ADMIN') private readonly firebase: admin.app.App,
        private readonly userService: UserService,
    ){}

    // validate user
    async validate(credentials: ValidateUserDTO): Promise<User| null> {
        const userClaims = await this.firebase.auth().verifyIdToken(credentials.token);
        console.log(userClaims)
        
        if (!userClaims) throw new BadRequestException("user is not registered! Please register before login")
        const user = await this.userService.findOne(new GetUserDTO(userClaims.uid))
        return user
    }


    // should register user and return user Object
    async register(credentials: RegisterUserDTO): Promise<User | null> {
        const firebaseUser = await this.firebase.auth().createUser({email: credentials.email, password: credentials.password, displayName: credentials.displayName})
        
        const {password, ...userData} = credentials
        const createUserDTO: CreateUserDTO = {...userData, "firebaseUid": firebaseUser.uid} 
        const newUser = await this.userService.createUser(createUserDTO)

        return newUser
    }


}