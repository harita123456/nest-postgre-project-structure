import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsInt,
    Min,
    Max,
} from 'class-validator';

export class TestNotificationDto {
    @ApiProperty({
        example: 'token_1, token_2, token_3',
        description: 'Comma-separated FCM device tokens',
    })
    @IsNotEmpty({ message: 'tokens is required' })
    @IsString({ message: 'tokens must be a string' })
    tokens!: string;

    @ApiProperty({ example: 'Test Notification', required: false })
    @IsOptional()
    @IsString({ message: 'title must be a string' })
    title?: string;

    @ApiProperty({
        example: 'This is a test push notification',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'message must be a string' })
    message?: string;

    @ApiProperty({ example: 'default', required: false })
    @IsOptional()
    @IsString({ message: 'sound_name must be a string' })
    sound_name?: string;

    @ApiProperty({ example: 'https://example.com/image.png', required: false })
    @IsOptional()
    @IsString({ message: 'noti_image must be a string' })
    noti_image?: string;

    @ApiProperty({ example: { any: 'data' }, required: false })
    @IsOptional()
    details?: unknown;
}

export class NotificationListQueryDto {
    @ApiProperty({ required: false, example: 1 })
    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number;

    @ApiProperty({ required: false, example: 20 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;
}
