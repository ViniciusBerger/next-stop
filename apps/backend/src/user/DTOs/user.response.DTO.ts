import { Exclude, Expose } from "class-transformer";
import { Types } from "mongoose";
import { Profile } from "../../profile/schemas/profile.schema";
import { Badge } from "../schemas/badges.schema";
import { User } from "../schemas/user.schema";

export class UserResponseDTO {

    @Exclude()
    _id:any;
    @Exclude()
    firebaseUid?: string;
    @Exclude()
    role?: string;
    @Expose()
    username: string; 
    @Expose()
    email: string;
    @Expose()
    profile: Profile;
    @Expose()
    bio: string;
    @Expose()
    profilePicture: Profile;
    @Expose()
    badges: Badge[];
    @Expose()
    friends: Types.ObjectId[];
    @Expose()
    isBanned: boolean
    @Exclude()
    createdAt?: Date;
    @Exclude()
    updatedAt?: Date;
    @Exclude()
    lastLogin?: Date;


    constructor(user: User) {
        this._id = user._id;
        this.firebaseUid = user.firebaseUid;
        this.role = user.role;
        this.username = user.username;
        this.email = user.email;
        this.profile = user.profile;
        this.badges = user.badges;
        this.friends = user.friends;
        this.isBanned = user.isBanned;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
        this.lastLogin = user.lastLogin;
    }
}
