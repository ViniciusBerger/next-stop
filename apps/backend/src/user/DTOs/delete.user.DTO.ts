import { IsString, IsNotEmpty } from 'class-validator';

export class DeleteUserDTO {
  @IsString()
  @IsNotEmpty()
  firebaseUid: string;
}