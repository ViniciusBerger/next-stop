import { Expose, Transform } from 'class-transformer';

export class ModerationUserDTO {
  @Expose()
  @Transform(({ value }) => value?.toString())
  _id: string;

  @Expose()
  firebaseUid: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  isBanned: boolean;

  @Expose()
  isSuspended: boolean;

  @Expose()
  suspendedUntil?: Date;

  @Expose()
  banReason?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  lastLogin?: Date;
}
