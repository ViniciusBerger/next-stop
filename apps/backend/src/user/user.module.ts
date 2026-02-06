import { Module } from "@nestjs/common";
import { UserController } from "./controller/user.controller";
import { UserService } from "./service/user.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, userSchema } from "./schemas/user.schema";
import { UserRepository } from "./user.repository";


@Module ({
    imports: [
    // This makes "UserSchemaModel" available inside this module
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }])
  ],
    controllers: [UserController],
    providers: [UserService, UserRepository],
    exports: [UserService]
})

export class UserModule{}