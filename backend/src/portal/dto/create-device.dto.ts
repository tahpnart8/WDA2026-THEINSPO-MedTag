import { IsString, Length, IsOptional, IsUUID } from 'class-validator';

export class CreateDeviceDto {
    @IsString()
    @Length(6, 6)
    shortId: string;

    @IsOptional()
    @IsString()
    qrCode?: string;

    @IsUUID()
    medicalRecordId: string;

    @IsOptional()
    @IsString()
    label?: string;
}
