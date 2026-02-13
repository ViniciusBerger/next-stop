import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { FriendsService } from "../service/friends.service";
import { FriendsRepository } from "../friends.repository";
import { User } from "../../user/schemas/user.schema";

describe("FriendsService", () => {
  let service: FriendsService;
  let repo: FriendsRepository;
  let userModel: Model<User>;

  // Include all repository methods used by the service/tests here.
  const mockFriendsRepository = {
    findRequest: jest.fn(),
    createRequest: jest.fn(),
    createFriendship: jest.fn(),
    updateRequestStatus: jest.fn(),
    removeFriendship: jest.fn(),
    listFriends: jest.fn(),
    // other methods may be added in future steps
  };

  // Minimal mock for Mongoose model: only findOne is needed here
  const mockUserModel = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        { provide: FriendsRepository, useValue: mockFriendsRepository },
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<FriendsService>(FriendsService);
    repo = module.get<FriendsRepository>(FriendsRepository);
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
    expect(userModel).toBeDefined();
  });

  it("requestFriend -> should create a pending friend request", async () => {
    const fromFirebaseUid = "from_uid_123";
    const toFirebaseUid = "to_uid_456";

    // Mock users found in DB with valid ObjectIds
    const fromUser = { _id: new Types.ObjectId(), firebaseUid: fromFirebaseUid };
    const toUser = { _id: new Types.ObjectId(), firebaseUid: toFirebaseUid };

    (userModel.findOne as any)
      .mockReturnValueOnce({ exec: () => Promise.resolve(fromUser) })
      .mockReturnValueOnce({ exec: () => Promise.resolve(toUser) });

    // No existing pending request
    (repo.findRequest as jest.Mock).mockResolvedValueOnce(null);

    // Created request doc
    const createdRequest = {
      _id: new Types.ObjectId(),
      from: fromUser._id,
      to: toUser._id,
      status: "pending",
      createdAt: new Date(),
    };
    (repo.createRequest as jest.Mock).mockResolvedValueOnce(createdRequest);

    const result = await service.requestFriend(fromFirebaseUid, toFirebaseUid);

    expect(result).toEqual(createdRequest);
    expect(userModel.findOne).toHaveBeenCalledTimes(2);
    expect(repo.findRequest).toHaveBeenCalledWith({
      from: fromUser._id,
      to: toUser._id,
      status: "pending",
    });
    expect(repo.createRequest).toHaveBeenCalled();
  });

  it("acceptRequest -> should accept a pending request and create friendship", async () => {
    const requestId = new Types.ObjectId();

    // Mock an existing pending request
    const mockReq = {
      _id: requestId,
      from: new Types.ObjectId(),
      to: new Types.ObjectId(),
      status: "pending" as const,
    };

    // findRequest returns the pending request
    (repo.findRequest as jest.Mock).mockResolvedValueOnce(mockReq);

    // createFriendship returns a created edge (we don't assert on it in detail here)
    (repo.createFriendship as jest.Mock).mockResolvedValueOnce({
      _id: new Types.ObjectId(),
      userId: mockReq.from,
      friendId: mockReq.to,
      since: new Date(),
    });

    // updateRequestStatus returns the updated request (accepted)
    const acceptedDoc = { ...mockReq, status: "accepted" as const };
    (repo.updateRequestStatus as jest.Mock).mockResolvedValueOnce(acceptedDoc as any);

    const result = await service.acceptRequest(requestId.toHexString());

    expect(repo.findRequest).toHaveBeenCalledWith({ _id: requestId });
    expect(repo.createFriendship).toHaveBeenCalledWith(mockReq.from, mockReq.to);
    expect(repo.updateRequestStatus).toHaveBeenCalledWith(requestId, "accepted");

    // Compare the whole returned doc to avoid property access issues on `result`
    expect(result).toEqual(acceptedDoc);
  });

  it("rejectRequest -> should reject a pending request", async () => {
    const requestId = new Types.ObjectId();

    // Mock an existing pending request
    const mockReq = {
      _id: requestId,
      from: new Types.ObjectId(),
      to: new Types.ObjectId(),
      status: "pending" as const,
    };

    (repo.findRequest as jest.Mock).mockResolvedValueOnce(mockReq);

    // updateRequestStatus returns the updated request (rejected)
    const rejectedDoc = { ...mockReq, status: "rejected" as const };
    (repo.updateRequestStatus as jest.Mock).mockResolvedValueOnce(rejectedDoc as any);

    const result = await service.rejectRequest(requestId.toHexString());

    expect(repo.findRequest).toHaveBeenCalledWith({ _id: requestId });
    expect(repo.updateRequestStatus).toHaveBeenCalledWith(requestId, "rejected");

    // Compare the whole returned doc to avoid property access issues on `result`
    expect(result).toEqual(rejectedDoc);
  });

  it("unfriend -> should remove friendship edge", async () => {
    const fromFirebaseUid = "from_uid_123";
    const friendFirebaseUid = "friend_uid_456";

    const fromUser = { _id: new Types.ObjectId(), firebaseUid: fromFirebaseUid };
    const friendUser = { _id: new Types.ObjectId(), firebaseUid: friendFirebaseUid };

    // Resolve both users
    (userModel.findOne as any)
      .mockReturnValueOnce({ exec: () => Promise.resolve(fromUser) })
      .mockReturnValueOnce({ exec: () => Promise.resolve(friendUser) });

    const removedEdge = {
      _id: new Types.ObjectId(),
      userId: fromUser._id,
      friendId: friendUser._id,
      since: new Date(),
    };
    // Mock repository removal
    (repo.removeFriendship as any) = (repo as any).removeFriendship ?? jest.fn();
    (repo.removeFriendship as jest.Mock).mockResolvedValueOnce(removedEdge as any);

    const result = await service.unfriend(fromFirebaseUid, friendFirebaseUid);

    expect(userModel.findOne).toHaveBeenCalledTimes(2);
    expect(repo.removeFriendship).toHaveBeenCalledWith(fromUser._id, friendUser._id);
    expect(result).toEqual(removedEdge);
  });

  it("listFriends -> should return friendship edges with pagination", async () => {
    const firebaseUid = "uid_123";
    const user = { _id: new Types.ObjectId(), firebaseUid };
    (userModel.findOne as any).mockReturnValueOnce({ exec: () => Promise.resolve(user) });

    const edges = [
      { _id: new Types.ObjectId(), userId: user._id, friendId: new Types.ObjectId(), since: new Date() },
      { _id: new Types.ObjectId(), userId: user._id, friendId: new Types.ObjectId(), since: new Date() },
    ];
    (repo.listFriends as any) = (repo as any).listFriends ?? jest.fn();
    (repo.listFriends as jest.Mock).mockResolvedValueOnce(edges as any);

    const result = await service.listFriends(firebaseUid, 10, 0);

    expect(userModel.findOne).toHaveBeenCalledWith({ firebaseUid });
    expect(repo.listFriends).toHaveBeenCalledWith(user._id, 10, 0);
    expect(result).toEqual(edges);
  });

  it("listRequests -> should list received pending requests with pagination", async () => {
    const firebaseUid = "uid_recv";
    const user = { _id: new Types.ObjectId(), firebaseUid };
    (userModel.findOne as any).mockReturnValueOnce({ exec: () => Promise.resolve(user) });

    const reqs = [
      { _id: new Types.ObjectId(), from: new Types.ObjectId(), to: user._id, status: "pending" },
    ];
    (repo.listRequests as any) = (repo as any).listRequests ?? jest.fn();
    (repo.listRequests as jest.Mock).mockResolvedValueOnce(reqs as any);

    const result = await service.listRequests(firebaseUid, "received", "pending", 10, 0);

    expect(userModel.findOne).toHaveBeenCalledWith({ firebaseUid });
    expect(repo.listRequests).toHaveBeenCalledWith({ to: user._id, status: "pending" }, 10, 0);
    expect(result).toEqual(reqs);
  });

  it("cancelRequest -> should cancel a pending request by the sender", async () => {
    const requestId = new Types.ObjectId();
    const senderFirebaseUid = "sender_uid";
    const senderUser = { _id: new Types.ObjectId(), firebaseUid: senderFirebaseUid };

    const mockReq = {
      _id: requestId,
      from: senderUser._id,
      to: new Types.ObjectId(),
      status: "pending",
    };

    (repo.findRequest as jest.Mock).mockResolvedValueOnce(mockReq);
    (userModel.findOne as any).mockReturnValueOnce({ exec: () => Promise.resolve(senderUser) });

    const cancelledDoc = { ...mockReq, status: "cancelled" as const };
    (repo.updateRequestStatus as jest.Mock).mockResolvedValueOnce(cancelledDoc as any);

    const result = await service.cancelRequest(requestId.toHexString(), senderFirebaseUid);

    expect(repo.findRequest).toHaveBeenCalledWith({ _id: requestId });
    expect(userModel.findOne).toHaveBeenCalledWith({ firebaseUid: senderFirebaseUid });
    expect(repo.updateRequestStatus).toHaveBeenCalledWith(requestId, "cancelled");
    expect(result).toEqual(cancelledDoc);
  });

});