import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CronjobsService {
    private readonly logger = new Logger(CronjobsService.name);
    // @Cron('* * * * *')
    // handleDailyTask() {
    //     this.logger.log('Running daily job');
    // }
}
