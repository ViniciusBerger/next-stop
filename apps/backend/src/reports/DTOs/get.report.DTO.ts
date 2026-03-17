import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';

export enum ReportStatus {
  PENDING = 'pending',
  COMPLETED = 'completed'
}

export enum ReportType {
  FEEDBACK = 'feedback',
  ISSUE = 'issue'
}

export class GetReportDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  id?: string; // MongoDB _id

  @IsOptional()
  @IsEnum(ReportStatus)
  status?: string; // Filter by status

  @IsOptional()
  @IsEnum(ReportType)
  type?: string; // Filter by type

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reportedBy?: string; // Filter by user (not used for now, but available)
}