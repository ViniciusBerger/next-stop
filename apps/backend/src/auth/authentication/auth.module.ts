import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { UserModule } from "src/user/user.module";
import { AuthService } from "./auth.service";
import { EmailStrategy } from "./strategies/email.strategy";
import { AuthStrategyFactory } from "./strategies/auth.strategy.factory";

@Module({
    // import modules to be used for this module
    imports: [UserModule],

    controllers: [AuthController],
  
    //providers are services which this module provides
    providers: [AuthService, EmailStrategy, AuthStrategyFactory], 
})
export class AuthModule {}



