import { IsOptional, IsString } from 'class-validator';

export class QueryParamsDto {
    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    medicalRecordId?: string;
}
