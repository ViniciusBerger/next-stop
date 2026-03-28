import { Exclude, Expose, Transform } from 'class-transformer';

export class ReportedItemResponseDTO {
  @Expose()
  itemType: string;

  @Expose()
  @Transform(({ value }) => value?.toString())
  itemId: string;
}

export class ReportResponseDTO {
  @Expose()
  @Transform(({ value }) => value?.toString())
  _id: string;

  @Expose()
  type: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  reportedBy: any; // Can be populated with User details

  @Expose()
  reportedItem?: ReportedItemResponseDTO; // Optional

  @Expose()
  status: string;

  @Expose()
  createdAt: Date;

  @Expose()
  completedAt?: Date;

  // No fields to exclude - admin can see everything
}