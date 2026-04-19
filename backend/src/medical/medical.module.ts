import { Module } from '@nestjs/common';
import { MedicalController } from './medical.controller';
import { MedicalService } from './medical.service';
import { AuthModule } from '../auth/auth.module';
import { CryptoModule } from '../crypto/crypto.module';

@Module({
    imports: [AuthModule, CryptoModule],
    controllers: [MedicalController],
    providers: [MedicalService],
})
export class MedicalModule { }
