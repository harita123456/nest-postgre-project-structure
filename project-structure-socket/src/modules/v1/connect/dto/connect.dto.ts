import { IsOptional, IsString, IsInt, Min, IsNotEmpty } from 'class-validator';

export class SetSocketDto {
    @IsString()
    @IsNotEmpty()
    token!: string;

    @IsOptional()
    @IsInt()
    user_id?: number;

    @IsOptional()
    @IsString()
    socket_id?: string;
}

export class CheckOnlineDto {
    @IsInt()
    @Min(1)
    userId!: number;
}

export class DisconnectDto {
    @IsString()
    socket_id!: string;
}
