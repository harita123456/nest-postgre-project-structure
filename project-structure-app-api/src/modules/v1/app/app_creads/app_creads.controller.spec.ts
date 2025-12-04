import { Test, TestingModule } from '@nestjs/testing';
import { AppCreadsController } from './app_creads.controller';

describe('AppCreadsController', () => {
    let controller: AppCreadsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AppCreadsController],
        }).compile();

        controller = module.get<AppCreadsController>(AppCreadsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
