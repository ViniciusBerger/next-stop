import { IsMongoId } from 'class-validator';

export class AddFriendDTO {

@IsMongoId()

requester:string;

@IsMongoId()

recipient:string;

}