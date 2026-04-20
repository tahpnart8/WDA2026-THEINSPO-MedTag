import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CryptoModule } from './crypto/crypto.module';
import { AuthModule } from './auth/auth.module';
import { EmergencyModule } from './emergency/emergency.module';
import { PortalModule } from './portal/portal.module';
import { MedicalModule } from './medical/medical.module';
import { NotificationModule } from './notification/notification.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    CryptoModule,
    AuthModule,
    EmergencyModule,
    PortalModule,
    MedicalModule,
    NotificationModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule { }
