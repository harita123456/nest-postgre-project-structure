import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CronjobsService {
    private readonly logger = new Logger(CronjobsService.name);
    constructor() {}

    // @Cron(CronExpression.EVERY_12_HOURS)
    // async processPendingRefundsJob() {
    //     logInfo('[CRON] pendingRefunds: start');
    //     try {
    //         const stats = await this.walletService.processPendingRefunds();
    //         logInfo(
    //             `[CRON] pendingRefunds: end total=${stats.total} attempted=${stats.attempted} succeeded=${stats.succeeded} insufficientFunds=${stats.insufficientFunds} missingDestination=${stats.missingDestination} errors=${stats.errors}`
    //         );
    //     } catch (e) {
    //         logError('[CRON] pendingRefunds: error', e as Error);
    //     }
    // }
}
