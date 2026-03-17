import { IsString, MinLength, MaxLength, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Validates incoming requests to update user-editable fields.
 */
export class UpdateUserDTO {
    @IsString()
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @MinLength(3)
    @MaxLength(30) // decent maximum username size
    username?: string;

    @IsString()
    @IsOptional() // decent maximum username size
    id?: string;

    @IsBoolean()
    @IsOptional()
    isBanned?: boolean
    
}