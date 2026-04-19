import { IsOptional, IsNumber } from 'class-validator';

export class TriggerSosDto {
    @IsOptional()
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @IsNumber()
    longitude?: number;
}
