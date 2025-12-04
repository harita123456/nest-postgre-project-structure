import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsInt,
    IsPositive,
    IsIn,
} from 'class-validator';
import { contentTypeEnum } from 'project-structure-database';
import { ApiProperty } from '@nestjs/swagger';

export type ContentType = (typeof contentTypeEnum.enumValues)[number];

export class AddContentDto {
    @ApiProperty({ enum: contentTypeEnum.enumValues })
    @IsNotEmpty()
    @IsIn(contentTypeEnum.enumValues)
    content_type!: ContentType;

    @ApiProperty({ example: 'This is Privacy policy' })
    @IsNotEmpty()
    @IsString()
    content!: string;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class EditContentDto {
    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    content_id!: number;

    @ApiProperty({ enum: contentTypeEnum.enumValues })
    @IsNotEmpty()
    @IsIn(contentTypeEnum.enumValues)
    content_type!: ContentType;

    @ApiProperty({ example: 'This is Privacy policy' })
    @IsNotEmpty()
    @IsString()
    content!: string;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class DeleteContentDto {
    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    content_id!: number;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class GetContentDto {
    @ApiProperty({ enum: contentTypeEnum.enumValues })
    @IsNotEmpty()
    @IsIn(contentTypeEnum.enumValues)
    content_type!: ContentType;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}
