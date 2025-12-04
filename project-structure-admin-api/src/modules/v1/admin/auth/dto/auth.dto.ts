import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsEmail,
    IsIn,
    IsLowercase,
    IsNumber,
} from 'class-validator';
import { deviceTypeEnum } from 'project-structure-database';
import { ApiProperty } from '@nestjs/swagger';

export type DeviceType = (typeof deviceTypeEnum.enumValues)[number];

export class AdminSignUpDto {
    @ApiProperty({ example: 'JK - Admin' })
    @IsString()
    @IsNotEmpty()
    first_name!: string;

    @ApiProperty({ example: 'JK - Admin' })
    @IsString()
    @IsNotEmpty()
    last_name!: string;

    @ApiProperty({ example: 'jk_admin@yopmail.com' })
    @IsEmail()
    @IsNotEmpty()
    @IsString()
    @IsLowercase()
    email_address!: string;

    @ApiProperty({ example: 'P@ssw0rd!' })
    @IsOptional()
    @IsString()
    password?: string;

    @ApiProperty({ enum: deviceTypeEnum.enumValues })
    @IsIn(deviceTypeEnum.enumValues)
    @IsNotEmpty()
    device_type!: DeviceType;

    @ApiProperty({ example: 'device_token_1' })
    @IsString()
    @IsOptional()
    device_token?: string;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class AdminSignInDto {
    @ApiProperty({ example: 'jk_admin@yopmail.com' })
    @IsEmail()
    @IsNotEmpty()
    @IsString()
    @IsLowercase()
    email_address!: string;

    @ApiProperty({ example: 'P@ssw0rd!' })
    @IsString()
    @IsNotEmpty()
    password!: string;

    @ApiProperty({ enum: deviceTypeEnum.enumValues })
    @IsIn(deviceTypeEnum.enumValues)
    @IsNotEmpty()
    device_type!: DeviceType;

    @ApiProperty({ example: 'device_token_1' })
    @IsString()
    @IsOptional()
    device_token?: string;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class RefreshTokenDto {
    @ApiProperty({ example: 'refresh_token_hex_string' })
    @IsNotEmpty()
    @IsString()
    refresh_token!: string;
}

export class AdminChangePasswordDto {
    @ApiProperty({ example: 'Old@1234' })
    @IsNotEmpty()
    @IsString()
    old_password!: string;

    @ApiProperty({ example: 'New@1234' })
    @IsNotEmpty()
    @IsString()
    new_password!: string;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class AdminSendOtpForgotPasswordDto {
    @ApiProperty({ example: 'jk_admin@yopmail.com' })
    @IsEmail()
    @IsNotEmpty()
    @IsString()
    @IsLowercase()
    email_address!: string;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class AdminVerifyOtpDto {
    @ApiProperty({ example: 7707 })
    @IsNotEmpty()
    @IsNumber()
    otp!: number;

    @ApiProperty({ example: 'jk_admin@yopmail.com' })
    @IsEmail()
    @IsNotEmpty()
    @IsString()
    @IsLowercase()
    email_address!: string;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class AdminResetPasswordDto {
    @ApiProperty({ example: 'jk_admin@yopmail.com' })
    @IsEmail()
    @IsNotEmpty()
    @IsString()
    @IsLowercase()
    email_address!: string;

    @ApiProperty({ example: 'New@1234' })
    @IsString()
    @IsNotEmpty()
    password!: string;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class GenerateUploadUrlDto {
    @ApiProperty({ example: 'uploads/avatars/avatar1.jpg' })
    @IsNotEmpty({ message: 'file_path is required' })
    @IsString({ message: 'file_path must be a string' })
    file_path!: string;

    @ApiProperty({ example: 'image/jpeg' })
    @IsNotEmpty({ message: 'file_type is required' })
    @IsString({ message: 'file_type must be a string' })
    file_type!: string;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class GenerateDownloadUrlDto {
    @ApiProperty({ example: 'uploads/avatars/avatar1.jpg' })
    @IsNotEmpty({ message: 'file_path is required' })
    @IsString({ message: 'file_path must be a string' })
    file_path!: string;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class DeleteFileDto {
    @ApiProperty({ example: 'uploads/avatars/avatar1.jpg' })
    @IsNotEmpty({ message: 'file_path is required' })
    @IsString({ message: 'file_path must be a string' })
    file_path!: string;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}
