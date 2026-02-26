import { Exclude, Expose, Type } from "class-transformer";
import { Profile } from "../../profile/schemas/profile.schema";
import { Badge } from "../../badges/schemas/badges.schema";

/**
 * DTO for sanitizing and returning user data to the client.
 * Decoupled from the database 'User' entity to prevent layer leakage.
 */
@Exclude() //excludes any field not marked with @Expose
export class UserResponseDTO {

     //Partial constructor allows for manual instantiation if needed
    constructor(partial: Partial<UserResponseDTO>) {
        Object.assign(this, partial);
    }
    
    @Expose()
    username: string; 

    @Expose()
    email: string;

    @Expose()
    @Type(() => Profile) // Ensure nested transformation
    profile: Profile;

    @Expose()
    bio: string;

    @Expose()
    profilePictureUrl: string; 

    @Expose()
    @Type(() => Badge)
    badges: Badge[];

    @Expose()
    friends: string[];

    @Expose()
    isBanned: boolean;

}