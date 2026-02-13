import { Test, TestingModule } from "@nestjs/testing";
import { FriendsController } from "./friends.controller";
import { FriendsService } from "../service/friends.service";
import { CreateFriendRequestDto } from "../DTOs/create-friend-request.dto";
import { AcceptRejectRequestParamDto } from "../DTOs/accept-reject-request.dto";
import { CancelFriendRequestBodyDto } from "../DTOs/cancel-friend-request.dto";
import { ListFriendRequestsQueryDto } from "../DTOs/list-friend-requests.dto";
import {
  ListFriendsParamDto,
  ListFriendsQueryDto,
} from "../DTOs/list-friends.dto";
import { UnfriendParamDto } from "../DTOs/unfriend.dto";

/**
 * FriendsController unit tests
 *
 * Tests to verify controller-service interaction and response shapes.
 * Note: DTO validation happens at the NestJS framework level (via ValidationPipe),
 * so it's not tested in unit tests. Use E2E tests for validation testing.
 */
describe("FriendsController (with DTOs)", () => {
  let controller: FriendsController;
  let service: FriendsService;

  const mockFriendsService = {
    requestFriend: jest.fn(),
    acceptRequest: jest.fn(),
    rejectRequest: jest.fn(),
    cancelRequest: jest.fn(),
    unfriend: jest.fn(),
    listFriends: jest.fn(),
    listRequests: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendsController],
      providers: [{ provide: FriendsService, useValue: mockFriendsService }],
    }).compile();

    controller = module.get<FriendsController>(FriendsController);
    service = module.get<FriendsService>(FriendsService);
  });

  it("should define controller and service", () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe("createRequest", () => {
    it("should forward to service and return envelope", async () => {
      const dto: CreateFriendRequestDto = {
        fromFirebaseUid: "from_uid_123",
        toFirebaseUid: "to_uid_456",
      };
      const created = {
        _id: "64f1f77bcf86cd799439011",
        from: "64f1f77bcf86cd799439001",
        to: "64f1f77bcf86cd799439002",
        status: "pending",
      };
      (service.requestFriend as jest.Mock).mockResolvedValueOnce(created);

      const result = await controller.createRequest(dto);

      expect(service.requestFriend).toHaveBeenCalledWith(
        dto.fromFirebaseUid,
        dto.toFirebaseUid
      );
      expect(result).toEqual({
        message: "Friend request sent",
        request: created,
      });
    });
  });

  describe("acceptRequest", () => {
    it("should accept request and return envelope", async () => {
      const params: AcceptRejectRequestParamDto = { 
        id: "507f1f77bcf86cd799439011" 
      };
      const updated = { _id: params.id, status: "accepted" };
      (service.acceptRequest as jest.Mock).mockResolvedValueOnce(updated);

      const result = await controller.acceptRequest(params);

      expect(service.acceptRequest).toHaveBeenCalledWith(params.id);
      expect(result).toEqual({
        message: "Friend request accepted",
        request: updated,
      });
    });
  });

  describe("rejectRequest", () => {
    it("should reject request and return envelope", async () => {
      const params: AcceptRejectRequestParamDto = { 
        id: "507f1f77bcf86cd799439011" 
      };
      const updated = { _id: params.id, status: "rejected" };
      (service.rejectRequest as jest.Mock).mockResolvedValueOnce(updated);

      const result = await controller.rejectRequest(params);

      expect(service.rejectRequest).toHaveBeenCalledWith(params.id);
      expect(result).toEqual({
        message: "Friend request rejected",
        request: updated,
      });
    });
  });

  describe("cancelRequest", () => {
    it("should cancel request and return envelope", async () => {
      const params: AcceptRejectRequestParamDto = { 
        id: "507f1f77bcf86cd799439011" 
      };
      const body: CancelFriendRequestBodyDto = { 
        senderFirebaseUid: "sender_uid_123" 
      };
      const updated = { _id: params.id, status: "cancelled" };
      (service.cancelRequest as jest.Mock).mockResolvedValueOnce(updated);

      const result = await controller.cancelRequest(params, body);

      expect(service.cancelRequest).toHaveBeenCalledWith(
        params.id,
        body.senderFirebaseUid
      );
      expect(result).toEqual({
        message: "Friend request cancelled",
        request: updated,
      });
    });
  });

  describe("unfriend", () => {
    it("should call service and return envelope", async () => {
      const params: UnfriendParamDto = {
        firebaseUid: "from_uid_123",
        friendFirebaseUid: "friend_uid_456",
      };
      const removed = {
        _id: "507f1f77bcf86cd799439012",
        userId: "507f1f77bcf86cd799439001",
        friendId: "507f1f77bcf86cd799439002",
      };
      (service.unfriend as jest.Mock).mockResolvedValueOnce(removed as any);

      const result = await controller.unfriend(params);

      expect(service.unfriend).toHaveBeenCalledWith(
        params.firebaseUid,
        params.friendFirebaseUid
      );
      expect(result).toEqual({
        message: "Unfriended successfully",
        removed,
      });
    });
  });

  describe("listFriends", () => {
    it("should call service and return edges", async () => {
      const params: ListFriendsParamDto = { 
        firebaseUid: "uid_123" 
      };
      const query: ListFriendsQueryDto = { 
        limit: 10, 
        skip: 0 
      };
      const edges = [
        {
          _id: "507f1f77bcf86cd799439021",
          userId: "507f1f77bcf86cd799439001",
          friendId: "507f1f77bcf86cd799439002",
          since: new Date(),
        },
      ];
      (service.listFriends as jest.Mock).mockResolvedValueOnce(edges as any);

      const result = await controller.listFriends(params, query);

      expect(service.listFriends).toHaveBeenCalledWith(
        params.firebaseUid,
        query.limit,
        query.skip
      );
      expect(result).toEqual(edges);
    });
  });

  describe("listRequests", () => {
    it("should call service with query parameters", async () => {
      const query: ListFriendRequestsQueryDto = {
        firebaseUid: "uid_123",
        type: "received",
        status: "pending",
        limit: 20,
        skip: 0,
      };
      const requests = [
        {
          _id: "507f1f77bcf86cd799439031",
          from: "507f1f77bcf86cd799439002",
          to: "507f1f77bcf86cd799439001",
          status: "pending",
        },
      ];
      (service.listRequests as jest.Mock).mockResolvedValueOnce(
        requests as any
      );

      const result = await controller.listRequests(query);

      expect(service.listRequests).toHaveBeenCalledWith(
        query.firebaseUid,
        query.type,
        query.status,
        query.limit,
        query.skip
      );
      expect(result).toEqual(requests);
    });
  });
});