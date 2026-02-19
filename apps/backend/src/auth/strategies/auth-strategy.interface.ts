import { Injectable } from "@nestjs/common";
import { User } from "src/user/user.schema";
/**
 * Interface for Authentication Strategies.
 * 
 * * This class serves as the foundation for all authentication providers 
 * (e.g., Email, Google, GitHub). It enforces a consistent structure 
 * for signing in and registering users across the platform.
 * 
 * @author Vinicius Berger
 */
Injectable()
export interface IAuthStrategy {
    /**
     * The unique identifier for the authentication provider (e.g., 'password', 'google').
     * Must be implemented by the child class.
     */
    readonly provider: string;

    /**
     * Authenticates a user based on provided credentials.
     * @param credentials Data required for login (e.g., email/password or OAuth token).
     * @returns A promise resolving to the user data or null if authentication fails.
     */
    validate(credentials: any): Promise<User | null>;

    /**
     * Handles the creation of a new user in both Firebase and the local database.
     * * @param credentials Registration data (e.g., email, password, username).
     * @returns A promise resolving to the newly created user's data.
     */
    register(credentials: any): Promise<User | null>;
}