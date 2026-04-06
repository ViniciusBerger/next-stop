import { Module } 
from '@nestjs/common';

import { MongooseModule }
from '@nestjs/mongoose';

import {
Friend,
FriendSchema,
}
from './schema/friends.schema';

import {
User,
userSchema
}
from '../user/schemas/user.schema';

import {
FriendsController
}
from './controller/friends.controller';

import {
FriendsService
}
from './service/friends.service';

import {
FriendsRepository
}
from './repository/friends.repository';

import { NotificationModule }
from '../notifications/notification.module';


@Module({

imports:[

NotificationModule,

MongooseModule.forFeature([

{
    name: Friend.name,
    schema: FriendSchema,
    collection: 'Friends'
  },

{
name:User.name,
schema:userSchema
}

])

],

controllers:[
FriendsController
],

providers:[
FriendsService,
FriendsRepository
],

exports:[
FriendsService
]

})

export class FriendsModule{}