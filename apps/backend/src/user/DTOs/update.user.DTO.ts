import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
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
    
}