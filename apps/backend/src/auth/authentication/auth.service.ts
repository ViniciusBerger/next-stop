import { Injectable } from "@nestjs/common";
import { AuthStrategyFactory } from "./strategies/auth.strategy.factory";

@Injectable()
export class AuthService {
    constructor(private readonly factory: AuthStrategyFactory) {}

    async handleRegister(provider: string, data: any) {
        const strategy = this.factory.getStrategy(provider)
        
        return await strategy.register(data)
    
    }
}