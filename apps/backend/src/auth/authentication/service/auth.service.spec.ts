import { AuthService } from "./auth.service"
import { Test, TestingModule } from "@nestjs/testing";
import { UserRepository } from "../../../user/user.repository";
import { AuthStrategyFactory } from "../strategies/auth-strategy.factory";
import { BadRequestException } from "@nestjs/common";
import { ValidateUserDTO } from "../DTOs/validate.user.DTO";

describe("AuthService", ()=> {
    
    let authService: AuthService;
    let userRepository: UserRepository
    
    const PROVIDER = "password"
    const expectedUser = {
            firebaseUid: "testUid",
            role: "member",
            username: "CodeMaster99",
            email: "testcase@example.com",
            password: "testPassword",} 

    const mockUserRepository = {
            findOne: jest.fn(), 
            createUser: jest.fn(),
            deleteUser: jest.fn(),
            updateUser: jest.fn()
    };

    const mockAuthStrategy = {
        validate: jest.fn().mockResolvedValue(expectedUser),
        register: jest.fn().mockResolvedValue(expectedUser),
    };

    const mockAuthStrategyFactory = {
    // This is the method the AuthService actually calls
    getStrategy: jest.fn().mockReturnValue(mockAuthStrategy) 
};


    beforeEach(async()=> {
        jest.clearAllMocks()
                // create testing environment before each it
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                AuthService, 
                {
                    provide: UserRepository,
                    // methods testing will have access to
                    useValue: mockUserRepository
                },
                {
                    provide: AuthStrategyFactory,
                    useValue: mockAuthStrategyFactory

                },
                ],
            }).compile();

        authService = module.get<AuthService>(AuthService);
        userRepository = module.get<UserRepository>(UserRepository);
    })


    it("Should define authService and userRepository", ()=> {
        expect(authService).toBeDefined()
        expect(userRepository).toBeDefined()
    })


    it("handleRegister -> Should register a user by email/password strategy", async ()=> {
        const mockUser = {
            username: "CodeMaster99",
            email: "testcase@example.com",
            password: "testPassword",
            displayName: "Code master"}
           
        
        const registeredUser = await authService.handleRegister(PROVIDER, mockUser)

        expect(registeredUser.username).toBe(expectedUser.username)
        expect(registeredUser.firebaseUid).toBe(expectedUser.firebaseUid)
        expect(mockAuthStrategyFactory.getStrategy).toHaveBeenCalledWith(PROVIDER);

    })

    it ("handleRegister -> Should return badRequest for a request with no body", async()=> {
        const mockUser = {}

        jest.spyOn(authService, "handleRegister").mockRejectedValue(new BadRequestException)

        expect(authService.handleRegister(PROVIDER, mockUser as any)).rejects.toThrow(BadRequestException)

        expect(authService.handleRegister).toHaveBeenCalledWith(PROVIDER, mockUser)
        expect(authService.handleRegister).toHaveBeenCalledTimes(1)

    })


    it ("handleValidate -> Should return a user validated by firebase", async()=> {
        const mockUser = {token: "testUid"}

        const validatedUser = await authService.handleValidate(PROVIDER, mockUser as ValidateUserDTO)

        expect(validatedUser.username).toBe(expectedUser.username)
        expect(validatedUser.firebaseUid).toBe(expectedUser.firebaseUid)
        expect(mockAuthStrategyFactory.getStrategy).toHaveBeenCalledWith(PROVIDER);
    })
})