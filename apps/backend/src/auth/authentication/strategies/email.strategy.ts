import { IAuthStrategy } from "./auth-strategy.interface";
import { RegisterUserDTO } from "../DTOs/register.user.DTO";
// Use a type-only import to avoid runtime dependency and circular refs in tests.
// IMPORTANT: this relative path assumes this file is at
// apps/backend/src/auth/authentication/strategies/email.strategy.ts
// and the User schema is at apps/backend/src/user/schemas/user.schema.ts
import type { User } from "../../../user/schemas/user.schema";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import admin from "firebase-admin";
import { UserService } from "../../../user/service/user.service";
import { CreateUserDTO } from "../../../user/DTOs/create.user.DTO";
// NOTE: GetUserDTO no longer needs to be constructed with `new`, so we don't import it here.
import { ValidateUserDTO } from "../DTOs/validate.user.DTO";

// Use the enum for role OR omit `role` to rely on schema default.
// IMPORTANT: confirm the relative path below. From:
//   apps/backend/src/auth/authentication/strategies/email.strategy.ts
// to:
//   apps/backend/src/user/user.role.enum.ts
// it should be ../../../user/user.role.enum
import { UserRole } from "../../../user/user.role.enum";

/**
 * EmailStrategy
 *
 * Concrete authentication strategy implementing IAuthStrategy.
 *
 * Handles email/password authentication using Firebase Admin
 * and synchronizes authenticated users with the local MongoDB database.
 *
 * - Validate users by verifying Firebase ID tokens
 * - Register new users in Firebase Authentication
 * - Create corresponding user records in the application database
 * - Return User entities for successful authentication flows
 *
 * Part of the Strategy + Factory authentication architecture, allowing
 * provider-specific logic to remain isolated from core services.
 *
 * @author Vinicius Berger
 */
@Injectable()
export class EmailStrategy implements IAuthStrategy {
  provider: string;

  // Inject Firebase Admin and UserService
  constructor(
    @Inject("FIREBASE_ADMIN") private readonly firebase: admin.app.App,
    private readonly userService: UserService,
  ) {}

  /**
   * Validate an authenticated user using Firebase ID token.
   * If the token is valid, we try to fetch the local user by firebaseUid.
   * Returns the User or null.
   */
  async validate(credentials: ValidateUserDTO): Promise<User | null> {
    const userClaims = await this.firebase.auth().verifyIdToken(credentials.token);

    if (!userClaims) {
      throw new BadRequestException("User is not registered! Please register before login");
    }

    // ❌ Old: new GetUserDTO(userClaims.uid) — DTO no longer has/needs a constructor
    // ✅ New: pass a plain object that matches the service signature
    const user = await this.userService.getUser({ firebaseUid: userClaims.uid });

    return user;
  }

  /**
   * Register a new user in Firebase Authentication and mirror
   * the record in the local database.
   * Returns the created User or null.
   */
  async register(credentials: RegisterUserDTO): Promise<User | null> {
    const firebaseUser = await this.firebase.auth().createUser({
      email: credentials.email,
      password: credentials.password,
      displayName: credentials.displayName,
    });

    // Option A (recommended): explicitly set role using the enum
    const createUserDTO: CreateUserDTO = {
      ...credentials,
      firebaseUid: firebaseUser.uid,
      role: UserRole.MEMBER, // enum value instead of literal string
    };

    // Option B (alternative): rely on schema default (remove role)
    // const createUserDTO: CreateUserDTO = {
    //   ...credentials,
    //   firebaseUid: firebaseUser.uid,
    // };

    const newUser = await this.userService.createUser(createUserDTO);
    return newUser;
  }
}