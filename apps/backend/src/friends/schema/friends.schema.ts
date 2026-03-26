import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'Friends' })

export class Friend extends Document {

@Prop({
type:Types.ObjectId,
ref:'User',
required:true
})

requester:Types.ObjectId;
// User sending request


@Prop({
type:Types.ObjectId,
ref:'User',
required:true
})

recipient:Types.ObjectId;
// User receiving request


@Prop({

type:String,

enum:[
'pending',
'accepted',
'rejected'
],

default:'pending'

})

status:string;
// Request state


@Prop({

type:Date,
default:Date.now

})

createdAt:Date;


@Prop({

type:Date

})

updatedAt:Date;

}

export const FriendSchema =
SchemaFactory.createForClass(Friend);