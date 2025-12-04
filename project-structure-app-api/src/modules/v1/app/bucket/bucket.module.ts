import { Module } from '@nestjs/common';
import { S3BucketController } from './bucket.controller';

@Module({
    controllers: [S3BucketController],
    providers: [],
})
export class S3BucketModule {}
