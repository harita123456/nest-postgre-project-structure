import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsBoolean,
    IsIn,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import {
    appUpdateStatusEnum,
    appPlatformEnum,
} from 'project-structure-database';

export type AppUpdateStatus = (typeof appUpdateStatusEnum.enumValues)[number];
export type AppPlatform = (typeof appPlatformEnum.enumValues)[number];

export class AddAppVersionDto {
    @ApiProperty({ example: '1.0.0' })
    @IsNotEmpty({ message: 'app version is required' })
    @IsString({ message: 'app version must be a string' })
    app_version!: string;

    @ApiProperty({ example: false })
    @IsNotEmpty({ message: 'is maintenance is required' })
    @IsBoolean({ message: 'is maintenance must be a boolean' })
    is_maintenance!: boolean;

    @ApiProperty({ enum: appUpdateStatusEnum.enumValues })
    @IsNotEmpty({ message: 'app update status is required' })
    @IsIn(appUpdateStatusEnum.enumValues, {
        message: 'app update status must be a valid app update status',
    })
    app_update_status!: AppUpdateStatus;

    @ApiProperty({ enum: appPlatformEnum.enumValues })
    @IsNotEmpty({ message: 'app platform is required' })
    @IsIn(appPlatformEnum.enumValues, {
        message: 'app platform must be a valid app platform',
    })
    app_platform!: AppPlatform;

    @ApiProperty({
        example: 'https://play.google.com/store/apps/details?id=com.example',
    })
    @IsNotEmpty({ message: 'app url is required' })
    @IsString({ message: 'app url must be a string' })
    app_url!: string;

    @ApiProperty({ example: 'https://api.example.com' })
    @IsNotEmpty({ message: 'api base url is required' })
    @IsString({ message: 'api base url must be a string' })
    api_base_url!: string;

    @ApiProperty({ example: true })
    @IsNotEmpty({ message: 'is live is required' })
    @IsBoolean({ message: 'is live must be a boolean' })
    is_live!: boolean;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString({ message: 'ln must be a string' })
    ln?: string;
}

export class AppVersionCheckDto {
    @ApiProperty({ example: '1.0.0' })
    @IsNotEmpty({ message: 'app version is required' })
    @IsString({ message: 'app version must be a string' })
    app_version!: string;

    @ApiProperty({ enum: appPlatformEnum.enumValues })
    @IsNotEmpty({ message: 'app platform is required' })
    @IsIn(appPlatformEnum.enumValues, {
        message: 'app platform must be a valid app platform',
    })
    app_platform!: AppPlatform;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString({ message: 'ln must be a string' })
    ln?: string;
}

export class UpdateAppVersionDto {
    @ApiProperty({ example: '1.0.0' })
    @IsNotEmpty({ message: 'app version is required' })
    @IsString({ message: 'app version must be a string' })
    app_version!: string;

    @ApiProperty({ example: false })
    @IsNotEmpty({ message: 'is maintenance is required' })
    @IsBoolean({ message: 'is maintenance must be a boolean' })
    is_maintenance?: boolean;

    @ApiProperty({ enum: appUpdateStatusEnum.enumValues })
    @IsNotEmpty({ message: 'app update status is required' })
    @IsIn(appUpdateStatusEnum.enumValues, {
        message: 'app update status must be a valid app update status',
    })
    app_update_status?: AppUpdateStatus;

    @ApiProperty({ enum: appPlatformEnum.enumValues })
    @IsNotEmpty({ message: 'app platform is required' })
    @IsIn(appPlatformEnum.enumValues, {
        message: 'app platform must be a valid app platform',
    })
    app_platform!: AppPlatform;

    @ApiProperty({
        example: 'https://play.google.com/store/apps/details?id=com.example',
    })
    @IsNotEmpty({ message: 'app url is required' })
    @IsString({ message: 'app url must be a string' })
    app_url?: string;

    @ApiProperty({ example: 'https://api.example.com' })
    @IsNotEmpty({ message: 'api base url is required' })
    @IsString({ message: 'api base url must be a string' })
    api_base_url?: string;

    @ApiProperty({ example: true })
    @IsNotEmpty({ message: 'is live is required' })
    @IsBoolean({ message: 'is live must be a boolean' })
    is_live?: boolean;

    @ApiProperty({ example: 'en' })
    @IsOptional()
    @IsString({ message: 'ln must be a string' })
    ln?: string;
}
