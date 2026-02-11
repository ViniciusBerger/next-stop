import { IsNotEmpty, IsString } from "class-validator";

export class ValidateUserDTO {
    @IsNotEmpty()
    @IsString()
    token: string;
}