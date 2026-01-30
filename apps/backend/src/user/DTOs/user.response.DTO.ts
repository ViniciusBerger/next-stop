import { Exclude, Expose } from "class-transformer";
import { Types } from "mongoose";
import { Profile } from "src/profile/schemas/profile.schema";
import { Badge } from "../schemas/badges.schema";

export class UserResponseDTO {
    
    @Exclude()
    _id:String;
    
    @Exclude()
    firebaseUid: string;
        
    @Exclude()
    role: string;
    
    @Expose()
    username: string;
        
    @Expose()
    email: string;
        
    @Expose()
    profile: Profile;
    
    @Expose()
    bio: string;
    
    @Expose()
    profilePicture: string;
    
    @Expose()
    badges: Badge[];
    
    @Expose()
    friends: Types.ObjectId[];
    
    @Expose()
    isBanned: boolean
    
    @Exclude()
    createdAt: Date;
    
    @Exclude()
    updatedAt: Date;
    
    @Exclude()
    lastLogin: Date;
    }
