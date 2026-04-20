import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationService {
    constructor(private config: ConfigService) { }

    async sendEmergencySMS(
        toPhone: string,
        patientName: string,
        mapsUrl: string,
    ): Promise<{ status: 'SENT' | 'MOCK_SENT'; sid?: string }> {

        const message = `[MedTag] 🚨 Cấp cứu!\nBệnh nhân ${patientName} đã được quét tại:\n${mapsUrl}\nYêu cầu liên hệ và hỗ trợ ngay!`;

        // MOCK SMS for MVP Hackathon
        console.log('\n=======================================');
        console.log(`📡 [MOCK SMS - GỬI ĐẾN]: ${toPhone}`);
        console.log(`💬 [NỘI DUNG]:\n${message}`);
        console.log('=======================================\n');

        return { status: 'MOCK_SENT', sid: 'SM' + Math.random().toString(36).substring(2, 10).toUpperCase() };
    }
}
