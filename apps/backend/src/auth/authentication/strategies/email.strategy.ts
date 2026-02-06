import { AuthStrategy } from "./auth.strategy.abstract";
import { UserRecord } from "firebase-admin/auth";
import { RegisterUserAuthDTO } from "../DTOs/register.user.auth.DTO";
import { User } from "src/user/schemas/user.schema";
import { Inject, Injectable } from "@nestjs/common";
import admin from 'firebase-admin'
import { UserService } from "src/user/service/user.service";
import { CreateUserDTO } from "src/user/DTOs/create.user.DTO";


/**
 * Concrete strategy class, it extends an Auth abstract class
 * which is the contract to be followed by any auth method in this application
 * 
 * EmailStrategy is meant to auth with email and password
 */
@Injectable()
export class EmailStrategy extends AuthStrategy {
    provider: string;

    // inject firebase admin
    constructor(
        @Inject('FIREBASE_ADMIN') firebase: admin.app.App,
        userService: UserService,
    ) {
        // pass injections to parents
        super(firebase, userService);
    }

    // to be done
    signIn(credentials: any): Promise<User| null> {
        throw new Error("Method not implemented.");
    }


    // should register user and return userObject
    async register(credentials: RegisterUserAuthDTO): Promise<User | null> {
        const firebaseUser:UserRecord = await this.firebase.auth().createUser({email: credentials.email, password: credentials.password, displayName: credentials.displayName})

        const createUserDTO: CreateUserDTO = {...credentials, "firebaseUid": firebaseUser.uid, role: "member"} 
        const newUser = await this.userService.createUser(createUserDTO)

        return newUser
    }

}