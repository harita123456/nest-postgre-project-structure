import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsBoolean,
    IsNumber,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class AddFaqDto {
    @ApiProperty({ example: 'What is FAQ?' })
    @IsNotEmpty()
    @IsString()
    question!: string;

    @ApiProperty({ example: 'Answer' })
    @IsNotEmpty()
    @IsString()
    answer!: string;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class EditFaqDto {
    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsNumber()
    faq_id!: number;

    @ApiProperty({ example: 'What is FAQ?' })
    @IsNotEmpty()
    @IsString()
    question!: string;

    @ApiProperty({ example: 'Answer' })
    @IsNotEmpty()
    @IsString()
    answer!: string;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class DeleteFaqDto {
    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsNumber()
    faq_id!: number;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class ListFaqDto {
    @ApiProperty({ example: 'What is FAQ?' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({ example: 1 })
    @IsNumber()
    page?: number;

    @ApiProperty({ example: 10 })
    @IsNumber()
    limit?: number;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class ActiveDeactiveFaqDto {
    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsNumber()
    faq_id!: number;

    @ApiProperty({ example: true })
    @IsNotEmpty()
    @IsBoolean()
    is_active!: boolean;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}
