import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class ListUsersDto {
    @ApiProperty({ example: 'alex' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({ example: 1 })
    @IsOptional()
    @IsNumber()
    page?: number;

    @ApiProperty({ example: 10 })
    @IsOptional()
    @IsNumber()
    limit?: number;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class blockUnblockUserDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    user_id!: number;

    @ApiProperty({ example: true })
    @IsBoolean()
    is_blocked_by_admin!: boolean;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}
