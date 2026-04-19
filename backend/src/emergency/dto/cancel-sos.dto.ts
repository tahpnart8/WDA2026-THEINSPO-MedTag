import { IsUUID } from 'class-validator';

export class CancelSosDto {
    @IsUUID()
    logId: string;
}
