import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';
import { contentTypeEnum } from 'project-structure-database';
import { ApiProperty } from '@nestjs/swagger';

export type ContentType = (typeof contentTypeEnum.enumValues)[number];

export class GetContentDto {
    @ApiProperty({ enum: contentTypeEnum.enumValues })
    @IsNotEmpty({ message: 'content type is required' })
    @IsIn(contentTypeEnum.enumValues, {
        message: 'content type must be a valid content type',
    })
    content_type!: ContentType;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString({ message: 'ln must be a string' })
    ln?: string;
}
