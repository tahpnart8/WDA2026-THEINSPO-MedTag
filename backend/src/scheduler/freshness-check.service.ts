import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FreshnessCheckService {
    constructor(
        private prisma: PrismaService,
    ) { }

    // Chạy mỗi ngày lúc 00:00 UTC
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async checkDataFreshness() {
        console.log('[CronJob] Bắt đầu quét tuổi thọ dữ liệu y tế...');

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        // 1. Chuyển FRESH -> STALE (> 6 tháng)
        const staleResult = await this.prisma.medicalRecord.updateMany({
            where: {
                dataFreshnessStatus: 'FRESH',
                dataConfirmedAt: { lt: sixMonthsAgo },
            },
            data: { dataFreshnessStatus: 'STALE' },
        });

        // 2. Chuyển STALE -> EXPIRED (> 12 tháng)
        const expiredResult = await this.prisma.medicalRecord.updateMany({
            where: {
                dataFreshnessStatus: 'STALE',
                dataConfirmedAt: { lt: twelveMonthsAgo },
            },
            data: { dataFreshnessStatus: 'EXPIRED' },
        });

        console.log(`[CronJob] Cập nhật ${staleResult.count} hồ sơ thành STALE, ${expiredResult.count} hồ sơ thành EXPIRED.`);
    }
}
