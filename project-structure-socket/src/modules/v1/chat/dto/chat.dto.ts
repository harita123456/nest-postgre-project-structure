import {
    IsInt,
    IsNotEmpty,
    IsString,
    IsOptional,
    IsArray,
    ValidateNested,
    IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
export class CreateRoomDto {
    @IsInt()
    @IsNotEmpty()
    user_id!: number;

    @IsInt()
    @IsNotEmpty()
    other_user_id!: number;
}

export class MediaFileDto {
    @IsString()
    @IsNotEmpty()
    file_type!: string;

    @IsString()
    @IsNotEmpty()
    file_path!: string;

    @IsString()
    @IsNotEmpty()
    file_name!: string;

    @IsString()
    @IsOptional()
    thumbnail?: string;
}

export class SendMessageDto {
    @IsInt()
    @IsNotEmpty()
    sender_id!: number;

    @IsInt()
    @IsNotEmpty()
    chat_room_id!: number;

    @IsInt()
    @IsNotEmpty()
    receiver_id!: number;

    @IsString()
    @IsOptional()
    message?: string;

    @IsString()
    @IsNotEmpty()
    message_type!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MediaFileDto)
    @IsOptional()
    media_file?: MediaFileDto[];

    @IsString()
    @IsOptional()
    ln?: string;
}

export class GetAllMessageDto {
    @IsInt()
    @IsNotEmpty()
    chat_room_id!: number;

    @IsInt()
    @IsNotEmpty()
    user_id!: number;

    @IsInt()
    @IsNotEmpty()
    page!: number;

    @IsInt()
    @IsNotEmpty()
    limit!: number;

    @IsString()
    @IsOptional()
    ln?: string;
}

export class EditMessageDto {
    @IsInt()
    @IsNotEmpty()
    chat_id!: number;

    @IsInt()
    @IsNotEmpty()
    chat_room_id!: number;

    @IsInt()
    @IsNotEmpty()
    user_id!: number;

    @IsString()
    @IsNotEmpty()
    message!: string;

    @IsString()
    @IsOptional()
    ln?: string;
}

export class DeleteMessageDto {
    @IsInt()
    @IsNotEmpty()
    chat_id!: number;

    @IsInt()
    @IsNotEmpty()
    chat_room_id!: number;

    @IsInt()
    @IsNotEmpty()
    user_id!: number;

    @IsString()
    @IsOptional()
    ln?: string;
}

export class DeleteMessageForEveryoneDto {
    @IsInt()
    @IsNotEmpty()
    chat_id!: number;

    @IsInt()
    @IsNotEmpty()
    chat_room_id!: number;

    @IsInt()
    @IsNotEmpty()
    user_id!: number;

    @IsString()
    @IsOptional()
    ln?: string;
}

export class ReadMessageDto {
    @IsInt()
    @IsNotEmpty()
    chat_room_id!: number;

    @IsInt()
    @IsNotEmpty()
    user_id!: number;

    @IsString()
    @IsOptional()
    ln?: string;
}

export class DeleteChatRoomDto {
    @IsInt()
    @IsNotEmpty()
    chat_room_id!: number;

    @IsInt()
    @IsNotEmpty()
    user_id!: number;

    @IsString()
    @IsOptional()
    ln?: string;
}

export class ChangeScreenStatusDto {
    @IsInt()
    @IsNotEmpty()
    chat_room_id!: number;

    @IsInt()
    @IsNotEmpty()
    user_id!: number;

    @IsBoolean()
    @IsNotEmpty()
    screen_status!: boolean;

    @IsString()
    @IsOptional()
    socket_id?: string;

    @IsString()
    @IsOptional()
    ln?: string;
}
