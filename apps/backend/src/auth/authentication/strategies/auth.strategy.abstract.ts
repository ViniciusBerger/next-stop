import { Inject, Injectable } from "@nestjs/common";
import { UserService } from "src/user/service/user.service";
import * as admin from 'firebase-admin';
import { UserResponseDTO } from "src/user/DTOs/user.response.DTO";

/**
 * Abstract Base Class for Authentication Strategies.
 * 
 * * This class serves as the foundation for all authentication providers 
 * (e.g., Email, Google, GitHub). It enforces a consistent structure 
 * for signing in and registering users across the platform.
 */
@Injectable()
export abstract class AuthStrategy {
    /**
     * The unique identifier for the authentication provider (e.g., 'password', 'google').
     * Must be implemented by the child class.
     */
    abstract readonly provider: string;

    /**
     * @param firebase The initialized Firebase Admin instance for managing auth records.
     * @param userService The internal service used to persist user data in database.
     */
    constructor(
        @Inject('FIREBASE_ADMIN') 
        protected readonly firebase: admin.app.App, 
        protected readonly userService: UserService, 
    ) {}

    /**
     * Authenticates a user based on provided credentials.
     * * @param credentials Data required for login (e.g., email/password or OAuth token).
     * @returns A promise resolving to the user data or null if authentication fails.
     */
    abstract signIn(credentials: any): Promise<UserResponseDTO | null>;

    /**
     * Handles the creation of a new user in both Firebase and the local database.
     * * @param credentials Registration data (e.g., email, password, username).
     * @returns A promise resolving to the newly created user's data.
     */
    abstract register(credentials: any): Promise<UserResponseDTO | null>;
}