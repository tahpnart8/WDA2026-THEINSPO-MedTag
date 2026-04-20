import { Module } from '@nestjs/common';
import { FreshnessCheckService } from './freshness-check.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [NotificationModule],
    providers: [FreshnessCheckService],
})
export class SchedulerModule { }
