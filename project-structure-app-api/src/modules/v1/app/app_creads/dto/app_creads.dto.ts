import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddAppCreadDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'app key is required' })
    @IsString({ message: 'app key must be a string' })
    app_key!: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'environment is required' })
    @IsString({ message: 'environment must be a string' })
    environment!: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'app_secret is required' })
    @IsString({ message: 'app_secret must be a string' })
    app_secret!: string;
}

export class UpdateAppCreadDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'app key is required' })
    @IsString({ message: 'app key must be a string' })
    app_key!: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'environment is required' })
    @IsString({ message: 'environment must be a string' })
    environment!: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'app_secret is required' })
    @IsString({ message: 'app_secret must be a string' })
    app_secret!: string;
}

export class GetAppCreadDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'app_key is required' })
    @IsString({ message: 'app_key must be a string' })
    app_key!: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'environment is required' })
    @IsString({ message: 'environment must be a string' })
    environment!: string;
}

export class DeleteAppCreadDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'app_key is required' })
    @IsString({ message: 'app_key must be a string' })
    app_key!: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'environment is required' })
    @IsString({ message: 'environment must be a string' })
    environment!: string;
}
