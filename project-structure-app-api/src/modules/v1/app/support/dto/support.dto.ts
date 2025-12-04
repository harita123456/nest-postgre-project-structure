import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsLowercase,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateSupportDto {
    @ApiProperty({ example: 'John' })
    @IsNotEmpty({ message: 'first name is required' })
    @IsString({ message: 'first name must be a string' })
    first_name!: string;

    @ApiProperty({ example: 'Doe' })
    @IsNotEmpty({ message: 'last name is required' })
    @IsString({ message: 'last name must be a string' })
    last_name!: string;

    @ApiProperty({ example: 'user@yopmail.com' })
    @IsEmail({}, { message: 'Email address must be valid' })
    @IsNotEmpty({ message: 'email address is required' })
    @IsString({ message: 'email address must be a string' })
    @IsLowercase({ message: 'email address must be lowercase' })
    email_address!: string;

    @ApiProperty({ example: 'Issue with user creation' })
    @IsNotEmpty({ message: 'subject is required' })
    @IsString({ message: 'subject must be a string' })
    subject!: string;

    @ApiProperty({
        example: 'I encountered an error when trying to create a user.',
    })
    @IsNotEmpty({ message: 'message is required' })
    @IsString({ message: 'message must be a string' })
    message!: string;

    @ApiProperty({
        example: 'https://cdn.yourapp.com/uploads/screenshot.png',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'attachment url must be a string' })
    attachment_url?: string;

    @ApiProperty({ example: 'en', required: false })
    @IsOptional()
    @IsString({ message: 'ln must be a string' })
    ln?: string;
}
