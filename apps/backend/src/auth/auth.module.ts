import { Module } from "@nestjs/common";
import { AuthController } from "./controller/auth.controller";
import { UserModule } from "src/user/user.module";
import { AuthService } from "./service/auth.service";
import { AuthStrategy } from "./strategies/auth-strategy";

@Module({
    // import modules to be used for this module
    imports: [UserModule],

    controllers: [AuthController],
  
    //providers are services which this module provides
    providers: [AuthService, AuthStrategy], 
})
export class AuthModule {}



