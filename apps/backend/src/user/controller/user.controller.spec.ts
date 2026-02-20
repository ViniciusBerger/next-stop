import { Test, TestingModule } from "@nestjs/testing"
import { UserController } from "./user.controller"
import { UserService } from "../service/user.service"
import { NotFoundException } from "@nestjs/common";
import { UserResponseDTO } from "../DTOs/user.response.DTO";
import { GetUserDTO } from "../DTOs/get.user.DTO";
import { UpdateUserDTO } from "../DTOs/update.user.DTO";
import { DeleteUserDTO } from "../DTOs/delete.user.DTO";

/**
 * UserController unit tests
 *
 * This test suite verifies the functionality of the UserController class, checking status code
 * and data transfer. It uses Jest for mocking dependencies and assertions.
 *
 * these tests follow the triple A of testing: Arrange, act and assert [AAA]
 *
 * To run the tests, use the command: npm test -- apps/backend/src/user/controller/user.controller.spec.ts
 *
 */

describe('UserController', () => {
    let userController: UserController;
    let userService: UserService;

    const mockUser = { username: 'testuser', firebaseUid: '1234567890123456789012345678' };
    const mockRequest = { user: { uid: '1234567890123456789012345678' } };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [{
                provide: UserService,
                useValue: {
                    findOne: jest.fn().mockResolvedValue(mockUser),
                    updateUser: jest.fn().mockResolvedValue(mockUser),
                    findById: jest.fn().mockResolvedValue(mockUser),
                    findByUsername: jest.fn().mockResolvedValue(mockUser),
                    deleteUser: jest.fn().mockResolvedValue(mockUser),
                }
            }]
        }).compile();

        userController = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
    });

    it("findOne -> Should extract UID from DTO and return UserResponseDTO", async () => {
        const params = { firebaseUid: '1234567890123456789012345678' };
        
        const result = await userController.findOne(params as GetUserDTO);

        expect(userService.findById).toHaveBeenCalledWith(params.firebaseUid);
        expect(result).toBeInstanceOf(UserResponseDTO);
        expect(result.username).toBe(mockUser.username);
    });

    it("updateUser -> Should pass req.user.uid and DTO to service", async () => {
        const updateDto = { username: 'newname' };
        
        const result = await userController.updateUser(mockRequest, updateDto as UpdateUserDTO);

        expect(userService.updateUser).toHaveBeenCalledWith(mockRequest.user.uid, updateDto);
        expect(result).toBeInstanceOf(UserResponseDTO);
    });

    it("deleteUser -> Should call service with DTO and return response", async () => {
        const params = { firebaseUid: '1234567890123456789012345678' };
        
        const result = await userController.deleteUser(params as DeleteUserDTO);

        expect(userService.deleteUser).toHaveBeenCalledWith(params);
        expect(result).toBeInstanceOf(UserResponseDTO);
    });

    it("findOne -> Should throw NotFoundException if user does not exist", async () => {
        jest.spyOn(userService, 'findById').mockResolvedValue(null);
        const params = { firebaseUid: 'missing' };

        await expect(userController.findOne(params as any))
            .rejects.toThrow(NotFoundException);
    });

});