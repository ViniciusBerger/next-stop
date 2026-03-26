import { IsMongoId } from 'class-validator';

export class GetFriendDTO {

@IsMongoId()

userId:string;

}