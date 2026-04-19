import { IsString, MinLength, IsOptional, IsDateString, IsEnum, IsArray, IsObject } from 'class-validator';
import { Gender, BloodType } from '@prisma/client';

export class CreateMedicalRecordDto {
    @IsString()
    @MinLength(2)
    patientName: string;

    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;

    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @IsOptional()
    @IsEnum(BloodType)
    bloodType?: BloodType;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allergies?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    dangerousConditions?: string[];

    @IsOptional()
    @IsString()
    emergencyPhone?: string;

    @IsOptional()
    @IsString()
    emergencyContactName?: string;

    @IsOptional()
    @IsObject()
    detailedMedicalData?: Record<string, any>;
}
