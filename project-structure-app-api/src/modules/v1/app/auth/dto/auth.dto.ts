import {
    IsEmail,
    IsLowercase,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsNumber,
    IsBoolean,
    IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
    userTypeEnum,
    socialPlatformEnum,
    deviceTypeEnum,
} from 'project-structure-database';

export type UserType = (typeof userTypeEnum.enumValues)[number];
export type SocialPlatform = (typeof socialPlatformEnum.enumValues)[number];
export type DeviceType = (typeof deviceTypeEnum.enumValues)[number];

export class CheckSocialMediaIdDto {
    @ApiProperty({ example: 'social_id_1' })
    @IsOptional()
    @IsString({ message: 'social id must be a string' })
    social_id!: string;

    @ApiProperty({ enum: socialPlatformEnum.enumValues })
    @IsIn(socialPlatformEnum.enumValues, {
        message: 'social platform must be a valid social platform',
    })
    @IsOptional()
    @IsString({ message: 'social platform must be a string' })
    social_platform!: SocialPlatform;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString({ message: 'ln must be a string' })
    ln?: string;
}

export class RefreshTokenDto {
    @ApiProperty({ example: 'refresh_token_hex_string' })
    @IsNotEmpty({ message: 'refresh token is required' })
    @IsString({ message: 'refresh token must be a string' })
    refresh_token!: string;
}

export class CheckEmailAddressDto {
    @ApiProperty({ example: 'user@yopmail.com' })
    @IsEmail({}, { message: 'email address must be valid' })
    @IsNotEmpty({ message: 'email address is required' })
    @IsString({ message: 'email address must be a string' })
    @IsLowercase({ message: 'email address must be lowercase' })
    email_address!: string;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString({ message: 'ln must be a string' })
    ln?: string;
}

export class CreateSessionDto {
    @ApiProperty({ example: 1 })
    @IsNotEmpty({ message: 'user_id is required' })
    @IsNumber({}, { message: 'user_id must be a number' })
    user_id!: number;

    @ApiProperty({ example: 'auth_token_1' })
    @IsNotEmpty({ message: 'auth_token is required' })
    @IsString({ message: 'auth_token must be a string' })
    auth_token!: string;

    @ApiProperty({ example: 'device_token_1' })
    @IsOptional()
    @IsString({ message: 'device_token must be a string' })
    device_token?: string;

    @ApiProperty({ enum: deviceTypeEnum.enumValues })
    @IsIn(deviceTypeEnum.enumValues, {
        message: 'device_type must be a valid device type',
    })
    @IsNotEmpty({ message: 'device_type is required' })
    device_type!: DeviceType;

    @ApiProperty({ example: 'refresh_token_hex_string', required: false })
    @IsOptional()
    @IsString({ message: 'refresh_token must be a string' })
    refresh_token?: string;
}

export class UserSignUpDto {
    @ApiProperty({ example: 'John' })
    @IsString({ message: 'first_name must be a string' })
    @IsNotEmpty({ message: 'first_name is required' })
    first_name?: string;

    @ApiProperty({ example: 'Doe' })
    @IsString({ message: 'last_name must be a string' })
    @IsNotEmpty({ message: 'last_name is required' })
    last_name?: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString({ message: 'user_name must be a string' })
    @IsNotEmpty({ message: 'user_name is required' })
    user_name?: string;

    @ApiProperty({ example: 'referral_code_1' })
    @IsString({ message: 'referral_code must be a string' })
    @IsOptional()
    referral_code?: string;

    @ApiProperty({ example: 'user@yopmail.com' })
    @IsEmail({}, { message: 'Email address must be valid' })
    @IsNotEmpty({ message: 'email_address is required' })
    @IsString({ message: 'email_address must be a string' })
    @IsLowercase({ message: 'email_address must be lowercase' })
    email_address!: string;

    @ApiProperty({ example: true })
    @IsOptional()
    @IsBoolean({ message: 'is_social_login must be a boolean' })
    is_social_login?: boolean;

    @ApiProperty({ example: 'social_id_1' })
    @IsOptional()
    @IsString({ message: 'social_id must be a string' })
    social_id?: string;

    @ApiProperty({ enum: socialPlatformEnum.enumValues })
    @IsIn(socialPlatformEnum.enumValues, {
        message: 'social_platform must be a valid social platform',
    })
    @IsOptional()
    @IsString({ message: 'social_platform must be a string' })
    social_platform?: SocialPlatform;

    @ApiProperty({ example: 'P@ssw0rd!' })
    @IsString({ message: 'password must be a string' })
    password!: string;

    @ApiProperty({ example: 'device_token_1' })
    @IsOptional()
    @IsString({ message: 'device_token must be a string' })
    device_token?: string;

    @ApiProperty({ enum: deviceTypeEnum.enumValues })
    @IsIn(deviceTypeEnum.enumValues, {
        message: 'device_type must be a valid device type',
    })
    @IsNotEmpty({ message: 'device_type is required' })
    device_type!: DeviceType;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString({ message: 'ln must be a string' })
    ln?: string;
}

export class UserSignInDto {
    @ApiProperty({ example: 'user@yopmail.com' })
    @IsEmail({}, { message: 'Email address must be valid' })
    @IsOptional()
    @IsString({ message: 'email_address must be a string' })
    @IsLowercase({ message: 'email_address must be lowercase' })
    email_address?: string;

    @ApiProperty({ example: 'John' })
    @IsString({ message: 'first_name must be a string' })
    @IsOptional()
    first_name?: string;

    @ApiProperty({ example: 'Doe' })
    @IsString({ message: 'last_name must be a string' })
    @IsOptional()
    last_name?: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString({ message: 'user_name must be a string' })
    @IsOptional()
    user_name?: string;

    @ApiProperty({ example: true })
    @IsOptional()
    @IsBoolean({ message: 'is_social_login must be a boolean' })
    is_social_login!: boolean;

    @ApiProperty({ example: 'social_id_1' })
    @IsOptional()
    @IsString()
    social_id?: string;

    @ApiProperty({ enum: socialPlatformEnum.enumValues })
    @IsIn(socialPlatformEnum.enumValues)
    @IsOptional()
    @IsString()
    social_platform?: SocialPlatform;

    @ApiProperty({ example: 'P@ssw0rd!' })
    @IsOptional()
    @IsString({ message: 'password must be a string' })
    password?: string;

    @ApiProperty({ example: 'device_token_1' })
    @IsOptional()
    @IsString()
    device_token?: string;

    @ApiProperty({ enum: deviceTypeEnum.enumValues })
    @IsIn(deviceTypeEnum.enumValues)
    @IsNotEmpty()
    device_type!: DeviceType;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString({ message: 'ln must be a string' })
    ln?: string;
}

export class UpdateProfileDto {
    @ApiProperty({ example: 'John', required: false })
    @IsOptional()
    @IsString({ message: 'first_name must be a string' })
    first_name?: string;

    @ApiProperty({ example: 'Doe', required: false })
    @IsOptional()
    @IsString({ message: 'last_name must be a string' })
    last_name?: string;

    @ApiProperty({ example: 'John Doe', required: false })
    @IsOptional()
    @IsString({ message: 'user_name must be a string' })
    user_name?: string;

    @ApiProperty({ example: 'uploads/avatars/avatar1.jpg', required: false })
    @IsOptional()
    @IsString({ message: 'profile_picture must be a string' })
    profile_picture?: string;
}

export class UserChangePasswordDto {
    @ApiProperty({ example: 'oldPassword123!' })
    @IsNotEmpty({ message: 'old_password is required' })
    @IsString({ message: 'old_password must be a string' })
    old_password!: string;

    @ApiProperty({ example: 'newPassword123!' })
    @IsNotEmpty({ message: 'new_password is required' })
    @IsString({ message: 'new_password must be a string' })
    new_password!: string;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class UserSendOtpForgotPasswordDto {
    @ApiProperty({ example: 'user@yopmail.com' })
    @IsEmail({}, { message: 'Email address must be valid' })
    @IsNotEmpty({ message: 'email_address is required' })
    @IsString({ message: 'email_address must be a string' })
    @IsLowercase({ message: 'email_address must be lowercase' })
    email_address!: string;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class UserVerifyOtpDto {
    @ApiProperty({ example: 7707 })
    @IsNotEmpty({ message: 'otp is required' })
    @IsNumber({}, { message: 'otp must be a number' })
    otp!: number;

    @ApiProperty({ example: 'user@yopmail.com' })
    @IsEmail({}, { message: 'Email address must be valid' })
    @IsNotEmpty({ message: 'email_address is required' })
    @IsString({ message: 'email_address must be a string' })
    @IsLowercase({ message: 'email_address must be lowercase' })
    email_address!: string;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class UserResetPasswordDto {
    @ApiProperty({ example: 'user@yopmail.com' })
    @IsEmail({}, { message: 'Email address must be valid' })
    @IsNotEmpty({ message: 'email_address is required' })
    @IsString({ message: 'email_address must be a string' })
    @IsLowercase({ message: 'email_address must be lowercase' })
    email_address!: string;

    @ApiProperty({ example: 'New@1234' })
    @IsString({ message: 'password must be a string' })
    @IsNotEmpty({ message: 'password is required' })
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

export class SendVerificationEmailDto {
    @ApiProperty({ example: 'user@yopmail.com' })
    @IsEmail({}, { message: 'Email address must be valid' })
    @IsNotEmpty({ message: 'email_address is required' })
    @IsString({ message: 'email_address must be a string' })
    @IsLowercase({ message: 'email_address must be lowercase' })
    email_address!: string;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class VerifyEmailDto {
    @ApiProperty({ example: 'user@yopmail.com' })
    @IsEmail({}, { message: 'Email address must be valid' })
    @IsNotEmpty({ message: 'email_address is required' })
    @IsString({ message: 'email_address must be a string' })
    @IsLowercase({ message: 'email_address must be lowercase' })
    email_address!: string;

    @ApiProperty({ example: 7707 })
    @IsNotEmpty({ message: 'otp is required' })
    @IsNumber({}, { message: 'otp must be a number' })
    otp!: number;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}

export class CheckUsernameDto {
    @ApiProperty({ example: 'username_1' })
    @IsNotEmpty({ message: 'username is required' })
    @IsString({ message: 'username must be a string' })
    username!: string;

    @ApiProperty({ example: 1 })
    @IsOptional()
    @IsNumber({}, { message: 'user_id must be a number' })
    user_id?: number;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString()
    ln?: string;
}
