import { Exclude, Expose, Type } from "class-transformer";
import { Profile } from "../../profile/schemas/profile.schema";
import { Badge } from "../../badges/schemas/badges.schema";

/**
 * DTO for sanitizing and returning user data to the client.
 * Decoupled from the database 'User' entity to prevent layer leakage.
 */
@Exclude() //excludes any field not marked with @Expose
export class UserResponseDTO {

/**
 * Removed constructor here intentionally.
 *
 * Previously we used Object.assign() in a manual constructor to map
 * incoming data. However, Object.assign() is a plain JS operation that
 * completely bypasses class-transformer's decorator system — meaning @Expose(),
 * @Exclude(), and @Type() decorators were never actually applied. Sensitive
 * fields were leaking to the client despite being marked @Exclude().
 *
 * The fix was to remove the constructor entirely and use plainToInstance()
 * in the controller instead, which lets class-transformer handle instantiation
 * and correctly apply all decorators before returning the response.
 *
 * See user.controller.ts for the updated controller code that uses plainToInstance()
 * to create UserResponseDTO instances from the User entity.
 */

    @Expose()
    username: string; 

    @Expose()
    email: string;

    @Expose()
    role: string; // Needed for frontend routing (member vs admin)

    @Expose()
    @Type(() => Object) // ← was Type(() => Profile), causing the crash
    profile: any;

    @Expose()
    bio: string;

    @Expose()
    profilePictureUrl: string; 

    @Expose()
    @Type(() => Object) // ← was Type(() => Badge)
    badges: any[];

    @Expose()
    friends: string[];

    @Expose()
    isBanned: boolean;

}