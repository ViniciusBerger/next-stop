import { IsMongoId,IsString }
from 'class-validator';

export class RespondFriendDTO {

@IsMongoId()

requestId:string;

@IsString()

status:string;

}