export interface EmergencyContact {
    name: string;
    phone: string;
}

export interface EmergencyProfile {
    deviceId: string;
    patientName: string;
    dateOfBirth: string | null;
    gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
    avatarUrl: string | null;
    bloodType: string;
    bloodTypeDisplay: string;
    allergies: string[];
    dangerousConditions: string[];
    emergencyContact: EmergencyContact;
    dataFreshness: 'FRESH' | 'STALE' | 'EXPIRED';
    lastConfirmed: string;
}

export interface SOSResponse {
    success: boolean;
    message: string;
    logId: string;
    mapsUrl?: string;
}
