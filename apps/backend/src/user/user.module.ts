import { Module } from "@nestjs/common";
import { UserController } from "./controller/user.controller";
import { UserService } from "./service/user.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, userSchema } from "./user.schema";
import { UserRepository } from "./repository/user.repository";

/**
 * Entry point for the User domain. 
 * Orchestrates identity management, social links, and profile persistence.
 */
@Module ({
  imports: [
    // Registers the User model for injection within this scoped context.
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }])
  ],
  controllers: [UserController],
  providers: [
    UserService, 
    UserRepository // Encapsulated here; only accessible to UserService.
  ],
  // Exporting UserService allows other modules (e.g., Auth, Social) to interact with User data safely.
  exports: [UserService]
})
export class UserModule{}