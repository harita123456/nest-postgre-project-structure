import { Controller, Get, Res } from '@nestjs/common';
import { logInfo } from './utils/logger';
import { Response } from 'express';

@Controller()
export class AppController {
    @Get('healthz')
    healthCheck(@Res() res: Response): void {
        logInfo('Health check');
        res.status(200).json({
            success: true,
            message: 'Health check',
        });
    }

    @Get('favicon.ico')
    favicon(@Res() res: Response): void {
        res.status(204).end();
    }

    @Get('/debug-sentry')
    getError() {
        throw new Error('My first Sentry error!');
    }
}
